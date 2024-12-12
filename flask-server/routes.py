from flask import Flask,jsonify,request,session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import time
from pprint import pprint
import spotipy.util as util
from spotipy.oauth2 import SpotifyClientCredentials
from spotipy.oauth2 import SpotifyOAuth
import tekore as tk
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import current_user
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from hmac import compare_digest
from flask_jwt_extended import get_jwt
import redis
import json
from datetime import timedelta
from datetime import timezone
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies
from flask_cors import CORS, cross_origin
from sqlalchemy import text
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import exc
from sqlalchemy import create_engine






client_id = 'bbdba9d33a94452d99c8ad6265848131'
client_secret = '45481fed0ca64752b897bc8b05fd9519'
ACCESS_EXPIRES = timedelta(hours=1)


app_token = tk.request_client_token(client_id, client_secret)

spotify = tk.Spotify(app_token)

# from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "DwayneSpotify"
app.config['SESSION_COOKIE_NAME'] = 'Dwaynes Cookie'
app.config["JWT_SECRET_KEY"] = "DWAYNETHEBOSSMADETHIS"  # Change this!
jwt = JWTManager(app)

TOKEN_INFO = "token_info"
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
# app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///site.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=10)
app.config["JWT_COOKIE_SAMESITE"] = "None"  # or "Lax", depending on requirements
app.config["JWT_COOKIE_SECURE"] = True  # Set to True for HTTPS only
app.config["JWT_COOKIE_DOMAIN"] = "127.0.0.1"
# app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'], isolation_level="READ COMMITTED")


db = SQLAlchemy(app)
ma = Marshmallow(app)


jwt_redis_blocklist = redis.StrictRedis(
    host="localhost", port=5000, db=0, decode_responses=True
)

@app.route('/')
def something():
    # sp_oauth = create_spotify_oauth()
    # auth_url = sp_oauth.get_authorize_url()
    # return redirect(auth_url)
    return "hi"

@app.route('/getToken', methods = ['POST'])
def token():
    token = request.json['token']
    print(token)

    return token

@app.route('/createUserToken', methods = ['POST'])
def create_usertoken():
    username = request.json.get("username", None)
    password = request.json.get("password", None)


@app.route('/getTracks')
def getTracks():
    track = spotify.track("2s8G3qj3sGDZq8hwt8COnQ?si=9dbeddf05df94afa")
    print(track.name)
    return jsonify(track.name)



class User(db.Model, SerializerMixin):
    serialize_only = ('id','username','password','playlists')

    id = db.Column(db.Integer, primary_key=True, index=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    password = db.Column(db.String(60), nullable=False)
    playlists = db.relationship('Playlist', backref='author', lazy=True)

    def __init__(self, username, password, image_file):
        self.username = username
        self.password = password
        self.image_file = image_file

    def check_password(self, password):
        return compare_digest(password, self.password)

class Playlist(db.Model, SerializerMixin):
    serialize_only = ('id','name','playlist','likes','date_posted', 'user_id', 'author', 'liked_by')
    # serialize_rules = ()
    id = db.Column(db.Integer, primary_key=True, index=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    playlist = db.Column(db.String(200), unique=True, nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    likes = db.Column(db.Integer, nullable = False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    username = db.Column(db.String(200), unique=False, nullable=False, index=True)
    liked_by = db.Column(db.PickleType, default=list)  # List of user IDs who liked the playlist

    __table_args__ = (
        db.Index('idx_username_likes_name_date', 'username', 'likes', 'name', 'date_posted'),
    )


    def __init__(self, playlist, likes,name, user_id, username):
        self.playlist = playlist 
        self.likes = likes
        self.name = name
        self.user_id = user_id
        self.username = username

class Like(db.Model):
    __tablename__ = 'like'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlist.id'), nullable=False)
    # Ensure a user can only like a playlist once by enforcing uniqueness
    __table_args__ = (db.UniqueConstraint('user_id', 'playlist_id', name='unique_user_playlist_like'),)

class PlaylistSchema(ma.Schema):
    class Meta:
        fields = ('id','playlist','date_posted', 'likes', 'name', 'user_id', 'username', 'liked_by')

class UserSchema(ma.Schema):
    class Meta:
        fields = ('id','username','password', 'image', 'playlists')



@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.id

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(seconds=10))
        if target_timestamp > exp_timestamp:
            id = get_jwt_identity()
            user = User.query.get(id)
            access_token = create_access_token(identity=user)
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original response
        return response

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()

@app.route("/login", methods=["POST"])
@cross_origin(methods=['POST'], supports_credentials=True, headers=['Content-Type', 'Authorization'], origin='http://127.0.0.1:3000')
def login():
    username = request.json['username']
    password = request.json['password']

    user = User.query.filter_by(username=username).one_or_none()
    if not user or not user.check_password(password):
        return jsonify("Wrong username or password" + user.username), 401

    # Notice that we are passing in the actual sqlalchemy user object here
    access_token = create_access_token(identity=user)
    response = jsonify({
        "msg": "login successful",
        'access_token': access_token
        })
    set_access_cookies(response, access_token)
    return response

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@app.route("/createAccount", methods=["POST"])
@cross_origin(methods=['POST'], supports_credentials=True, headers=['Content-Type', 'Authorization'], origin='http://127.0.0.1:3000')
def create_account():
    username = request.json['username']
    password = request.json['password']
    image = request.json['image']

    check_username = User.query.filter_by(username=username).one_or_none()

    if check_username:
        return jsonify("Username exists!"), 401


    new_user = User(username = username, password = password, image_file = image)

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user)
    response = jsonify({
        "msg": "Account creation successful",
        'access_token': access_token
        })
    set_access_cookies(response, access_token)
    return response

# Endpoint to get like status
@app.route('/likeStatus/<int:playlist_id>', methods=['GET'])
def get_like_status(playlist_id):
    # playlist = Playlist.query.get(playlist_id)
    playlist = db.session.get(Playlist, playlist_id)
    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404

    user_id = request.args.get('userId')  # Pass user ID as query parameter
    is_liked = user_id in playlist.liked_by if user_id else False
    return jsonify({'isLiked': is_liked, 'likes': playlist.likes})




@app.route('/like/<int:playlist_id>', methods=['POST'])
@jwt_required()
def like_playlist(playlist_id):
    playlist = Playlist.query.get(playlist_id)
    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404


    if playlist.liked_by is None:
        playlist.liked_by = []

    try:

        if current_user.id not in playlist.liked_by:
            playlist.liked_by.append(current_user.id)
            
            flag_modified(playlist, "liked_by")
            
            playlist.likes += 1

            db.session.commit()

            return jsonify({'message': 'Playlist liked successfully', 'likes': playlist.likes, 'liked_by': playlist.liked_by}), 200
        else:
            return jsonify({'error': 'Playlist already liked by this user'}), 400

    except exc.IntegrityError as e:
        db.session.rollback()
        return jsonify({'error': 'There was an error processing your request. Please try again.'}), 500

@app.route('/unlike/<int:playlist_id>', methods=['POST'])
@jwt_required()
def unlike_playlist(playlist_id):
    playlist = Playlist.query.get(playlist_id)
    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404


    try:

        if current_user.id in playlist.liked_by:
            playlist.liked_by.remove(current_user.id)
            
            flag_modified(playlist, "liked_by")
            
            playlist.likes -= 1

            db.session.commit()

            return jsonify({'message': 'Playlist liked successfully', 'likes': playlist.likes, 'liked_by': playlist.liked_by}), 200
        else:
            return jsonify({'error': 'Playlist already liked by this user'}), 400

    except exc.IntegrityError as e:
        db.session.rollback()
        return jsonify({'error': 'There was an error processing your request. Please try again.'}), 500

@app.route("/who_am_i", methods=["GET"])
@jwt_required(locations='cookies')
def protected():
    # We can now access our sqlalchemy User object via `current_user`.
    return jsonify(
        id=current_user.id,
        username=current_user.username,
    )






playlist_schema = PlaylistSchema()
playlists_schema = PlaylistSchema(many=True)


@app.route('/get', methods=['GET'])
def get_playlists():
    all_playlists = Playlist.query.all()
    results = playlists_schema.dump(all_playlists)
    return jsonify(results)


@app.route('/getImage/<id>', methods=['GET'])
def get_Image(id):
    # sp = spotipy.Spotify(auth=token)
    # pl_id = 'spotify:playlist:2glOoKv4sZJtCAHqriiEkh'
    offset = 0
    playlist = db.session.get(Playlist, id).playlist
    playlist_final = playlist[34:56]
    

    Image = spotify.playlist_cover_image(playlist_final)
    return jsonify(Image[0].url)



@app.route('/getOriginalName/<id>')
def get_original_name(id):
    playlist = db.session.get(Playlist, id)

    playlist = db.session.get(Playlist, id).playlist
    playlist_final = playlist[34:56]

    name = spotify.playlist(playlist_final,
                                    fields=None,
                                    market = None,
                                    as_tracks = False,
                                    )

    print(name.name)

    result = name.name

    
    return jsonify(result)

@app.route('/getURL/<id>')
def get_url(id):
    name = db.session.get(Playlist, id).name
    date = db.session.get(Playlist, id).date_posted.strftime("%m/%d/%Y, %H:%M")
    playlist = db.session.get(Playlist, id).playlist

    return jsonify({
        "name": name,
        "date": date,
        "playlist": playlist
    })


@app.route('/playlist/<id>')
def get_playlist(id):
    # playlist_object = Playlist.query.get(id)
    arr = []
    test = []

    playlist = db.session.get(Playlist, id).playlist
    playlist_final = playlist[34:56]

    playlist = spotify.playlist_items(playlist_final,
                                    fields="items.track.name,items.track.artists.name",
                                    market = None,
                                    as_tracks = False,
                                    limit = 100,
                                    offset = 0)


    for i in range(len(playlist['items'])):
        print(playlist['items'][i]['track']['artists'])
        arr.append(playlist['items'][i]['track']['artists'])



        print(arr)

    
    result = playlist['items']

    return jsonify(songs= result)

@app.route('/delete/<id>', methods=['POST'])
def delete_playlist(id):
    try:
        delete_query = text("DELETE FROM playlist WHERE id = :id")
        
        db.session.execute(delete_query, {'id': id})
        
        db.session.commit()

        return jsonify({'message': 'Playlist deleted successfully'}), 200

    except exc.SQLAlchemyError as e:
        db.session.rollback()
        
        print(f"Error deleting playlist with ID {id}: {e}")
        
        return jsonify({'error': 'An error occurred while deleting the playlist'}), 500

@app.route('/editPlaylistName/<id>', methods=['POST'])
def edit_playlist(id):
    new_name = request.get_json().get("new_name")
    
    if not new_name:
        return jsonify({'error': 'New name is required'}), 400

    try:

        playlist = db.session.get(Playlist, id)
        if not playlist:
            return jsonify({'error': 'Playlist not found'}), 404

        edit_query = text("UPDATE playlist SET name = :new_name WHERE id = :id")
        db.session.execute(edit_query, {'id': id, 'new_name': new_name})

        db.session.commit()

        return jsonify({'message': 'Playlist edited successfully'}), 200

    except exc.IntegrityError as e:
        db.session.rollback()
        return jsonify({'error': 'There was an error processing your request. Please try again.'}), 500

@app.route('/add', methods=['POST'])
@jwt_required()
def add_playlist():
    playlist = request.json['playlist']
    name  = request.json['name']
    id=current_user.id
    playlists = Playlist(playlist,0,name,current_user.id, current_user.username) #add current user id

    results = playlist_schema.dump(playlists)


    db.session.add(playlists)
    db.session.commit()



    # return jsonify(results)

@app.route('/getPlaylistsFromUser', methods=['GET'])
@jwt_required()
def get_user_playlists():
    id = current_user.id
    all_playlists = User.query.get(id).playlists
    results = playlists_schema.dump(all_playlists)
    return jsonify(results)


@app.route('/filter_playlists', methods=['GET'])
def filter_playlists():
    # Retrieve filter parameters from the query string
    date_range = request.args.get('date_range')  # Date in YYYY-MM-DD format
    likes = request.args.get('likes')  # Integer for the number of likes
    playlist_name = request.args.get('playlist_name')  # Playlist ID (can be optional)
    name = request.args.get('username')  # Name of the playlist (can be partial)
        
    # Start the query with all playlists
    query = Playlist.query
    print(date_range)

    # Filter by date if provided
    if date_range:
        try:
            # Split the date range into start and end dates
            start_date_str, end_date_str = date_range.split(' to ')
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')  # Convert the start date to a datetime object
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')  # Convert the end date to a datetime object
            print(start_date)
            print(end_date)

            # Apply the date range filter to the query
            query = query.filter(Playlist.date_posted >= start_date, Playlist.date_posted <= end_date)
        except ValueError:
            return jsonify({'error': 'Invalid date range format, use YYYY-MM-DD to YYYY-MM-DD'}), 400

    # Filter by number of likes if provided
    if likes:
        try:
            likes = int(likes)
            query = query.filter(Playlist.likes >= likes)
        except ValueError:
            return jsonify({'error': 'Likes must be an integer'}), 400

    # Filter by playlist ID if provided
    if playlist_name:
        query = query.filter(Playlist.name.ilike(f'%{playlist_name}%'))

    # Filter by playlist name if provided (case-insensitive partial match)
    if name:
        query = query.filter(Playlist.username.ilike(f'%{name}%'))

    # Execute the query and return the results
    playlists = query.all()

    # If no playlists found, return an error
    if not playlists:
        return jsonify({'message': 'No playlists found matching the criteria'})

    # Serialize the playlists to return them in a JSON-friendly format
    playlist_data = []
    for playlist in playlists:
        playlist_data.append({
            'id': playlist.id,
            'name': playlist.name,
            'likes': playlist.likes,
            'created_at': playlist.date_posted,
            'username': playlist.username
        })

    return jsonify(playlist_data), 200

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/myAccount/posts')
@jwt_required(locations='cookies')
def view_posts():

    print(User.query.get(1).posts)



with app.app_context():
    db.create_all()






# @app.before_first_request
# def create_tables():
#     db.drop_all()
#     db.create_all()
#     db.session.add(User(username="test", password="test", image_file="default.jpg"))
#     db.session.add(User(username="dwayne", password="test", image_file="default.jpg"))
#     db.session.commit()



    

