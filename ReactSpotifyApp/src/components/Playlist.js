import React from "react";
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Credentials } from '../Credentials';
import Playlist from "./Playlist";
import { Link } from "react-router-dom";
import PlaylistDetails from "../Pages/PlaylistDetails";
import Card from "./Card";


const Home = () => {
    const spotify = Credentials();

  const [token, setToken] = useState('');
  const [playlist, setPlaylist] = useState({setlectedPlaylist: '', listofSongsfromPlaylist: [], playlistImages: []});
  const [artistName, setArtistName] = useState({listofArtistNames: []})
  const [data,setData] = useState([{}])
  const [playlistsDB, setPlaylistDB] = useState([])

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get", {
        'method': 'GET',
        headers: {
          'mode': 'no-cors',
          'Content-Type': 'applications/json'
        }
      })
      .then(resp => resp.json())
      .then(resp => 
        setPlaylistDB(resp))
      .catch(error => console.log(error))
      
  
  }, [spotify.ClientId, spotify.ClientSecret])

  console.log(playlistsDB)

    return (
        <div class="w-100 grid grid-cols-2 gap-4 md:grid-cols-3">
            {playlistsDB.map(playlist => {
              return (
                <div key = {playlist.id}>
                <Link to ={`/playlists/${playlist.id}`}>
                <Card name={playlist.name} id={playlist.id} username={playlist.username} likes={playlist.likes}> </Card>
                </Link>
                </div>
              )
             })}
        </div>
    )
}

export default Home