import logo from './logo.svg';
import './App.css';
import { Credentials } from './Credentials';
import { useCallback, useEffect, useState, useContext } from 'react';
import React from 'react';
import axios from 'axios';
import Names from './Pages/PlaylistDetails';
import Playlist from './components/Playlist';
import {BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home';
import PlaylistDetails from './Pages/PlaylistDetails';
import NavbarComponent from './components/NavbarComponent';
import AddPlaylist from './Pages/AddPlaylist'
import Login from './Pages/Login'
import injectContext from "./store/appContext";
import { Provider } from 'react-redux'
import CreateAccount from './Pages/CreateAccount';
import UserAccount from './Pages/UserAccount';
import ViewPosts from './Pages/ViewPosts'
import { Context } from './store/appContext';
import GenerateReportPage from './Pages/GenerateReportPage';





const App = () => {

  const spotify = Credentials();

  const [token, setToken] = useState('');
  const [playlist, setPlaylist] = useState({setlectedPlaylist: '', listofSongsfromPlaylist: [], playlistImages: []});
  const [artistName, setArtistName] = useState({listofArtistNames: []})
  const [data,setData] = useState([{}])
  const [playlistsDB, setPlaylistDB] = useState([])
  const { store, actions } = useContext(Context);


  useEffect(() => {
    console.log('hey big bro')

    // fetch("127.0.0.1:5000/members").then(
    //   res => res.json()
    // ).then(
    //     data => {
    //       setData(data)
    //       console.log(data)
    //     }
    // 
        }, [spotify.ClientId, spotify.ClientSecret]);



        return (
          <div className="min-h-screen bg-blue-200">     
              
          <BrowserRouter>
          {
            sessionStorage.getItem("token") ? <NavbarComponent /> : <NavbarComponent />
          }
          
          <Routes>
           <Route path ='/' element={<Home/>} />
           <Route path ='/login' element={<Login/>} />
           <Route path ='/playlists' element={<Playlist/>} />
           <Route path = '/playlists/:id/*' element={<PlaylistDetails />} />
           <Route path = '/add' element={<AddPlaylist />}/>
           <Route path = '/createAccount' element={<CreateAccount />}/>
           <Route path = '/myAccount' element={<UserAccount />}/>
           <Route path = '/viewUserPlaylists' element={<ViewPosts />}/>
           <Route path = '/report' element={<GenerateReportPage />}/>

          </Routes>
          </BrowserRouter>
          </div>
        );
       }
  

export default injectContext(App);
