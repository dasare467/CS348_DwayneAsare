import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Credentials } from '../Credentials';
import PlaylistHeader from '../components/PlaylistHeader';
import Tracks from './Tracks';

const PlaylistDetails = () => {
  const spotify = Credentials();

  const [playlist, setPlaylist] = useState({ listofSongsfromPlaylist: [] });
  const [playlistName, setPlaylistName] = useState('');
  const [imageURL, setImage] = useState('');
  const [playlistURL, setPlaylistURL] = useState('');
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { id } = useParams();
  const [pl_wanted, setPlWanted] = useState([]);
  const userId = "2"
  const token = localStorage.getItem("token")
  
  const fetchPlaylistDetails = () => {
    // Fetching playlist details
    fetch(`http://127.0.0.1:5000/playlist/${id}`, { method: 'GET' })
      .then((resp) => resp.json())
      .then((resp) => setPlaylist({ listofSongsfromPlaylist: resp }))
      .catch((error) => console.log(error));

    // Fetching playlist image
    fetch(`http://127.0.0.1:5000/getImage/${id}`, { method: 'GET' })
      .then((resp) => resp.json())
      .then((resp) => setImage(resp))
      .catch((err) => console.log(err));

    // Fetching playlist name
    fetch(`http://127.0.0.1:5000/getOriginalName/${id}`, { method: 'GET' })
      .then((resp) => resp.json())
      .then((resp) => setPlaylistName(resp))
      .catch((err) => console.log(err));

    // Fetching playlist URL
    fetch(`http://127.0.0.1:5000/getURL/${id}`, { method: 'GET' })
      .then((resp) => resp.json())
      .then((resp) => setPlaylistURL(resp.playlist))
      .catch((err) => console.log(err));

    // Fetching the number of likes
    fetch(`http://127.0.0.1:5000/likeStatus/${id}`, { method: 'GET' })
      .then((resp) => resp.json())
      .then((resp) => {
        setLikes(resp.likes);
        setIsLiked(resp.isLiked);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  
  // const handleLike = () => {
  //   const token = sessionStorage.getItem('token'); // Get token from localStorage
    
  //   if (!token) {
  //     console.log('No token found, user is not logged in.');
  //     return;
  //   }
  
  //   // Send request to like the playlist without userId in the body
  //   axios.post(
  //     `http://127.0.0.1:5000/like/${id}`, 
  //     {}, // No need to pass the userId anymore
  //     {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,  // Send the token for authentication
  //         'Content-Type': 'application/json'    // Ensure the request is in JSON format
  //       }
  //     }
  //   )
  //   .then((response) => {
  //     // Update the likes count and mark as liked
  //     setLikes(response.data.likes);
  //     setIsLiked(true);
  //   })
  //   .catch((err) => {
  //     console.error('Error:', err.response ? err.response.data : err);
  //   });
  // };

  const handleLike = () => {
    const token = sessionStorage.getItem('token'); // Get token from sessionStorage
    
    if (!token) {
      console.log('No token found, user is not logged in.');
      return;
    }
  
    const url = isLiked
      ? `http://127.0.0.1:5000/unlike/${id}` // Unlike if already liked
      : `http://127.0.0.1:5000/like/${id}`; // Like if not liked yet
  
    axios.post(
      url, 
      {}, // No need to pass userId anymore
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Send the token for authentication
          'Content-Type': 'application/json'    // Ensure the request is in JSON format
        }
      }
    )
    .then((response) => {
      // Update the likes count based on the response from the server
      setLikes(response.data.likes);
      setIsLiked(!isLiked); // Toggle the liked status
    })
    .catch((err) => {
      console.error('Error:', err.response ? err.response.data : err);
      console.log(err.response.data.error)
      if ( err.response.data.error === 'Playlist already liked by this user') {
        setIsLiked(!isLiked); // Set isLiked to false (unlike)
        console.log("cheres")
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(`http://127.0.0.1:5000/delete/${id}`, {})
      .then(() => {
        alert('Deleted Successfully!');
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen content-center">
      <div className="absolute px-10 py-2 right-0.5">
        <button
          onClick={handleSubmit}
          className="inline-flex items-center px-2 bg-blue-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className=" h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <PlaylistHeader image={imageURL} name={playlistName}></PlaylistHeader>
      <div className="text-center">
        <a href={playlistURL}>
          <button className="m-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            View Playlist On Spotify!
          </button>
        </a>
        <button
          className="m-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleLike}
          // disabled={isLiked}
          style={{
            backgroundColor: isLiked ? 'gray' : 'blue',
            color: 'white',
          }}
        >
          {isLiked ? 'Liked' : 'Like'}
        </button>
        <div>
          <p>{likes} Likes</p>
        </div>
      </div>
      <Tracks id={id}></Tracks>
    </div>
  );
};

export default PlaylistDetails;
