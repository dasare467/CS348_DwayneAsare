import axios from "axios";
import React, {useContext, useState, useEffect} from "react";
import { Link, Navigate, redirect } from "react-router-dom";
import HowToImage from "../HowToImage.png"
import AddPLAYLIST from "../AddPLAYLIST.png"
import { Context } from "../store/appContext";


const AddPlaylist = () => {
    const [URL, setURL] = useState("");
    const { store, actions } = useContext(Context);
    const [name, setName] = useState("");
    const [isPending, setIsPending] = useState(false);
    
    useEffect(() => {
        console.log(store)
      
      }, [])
    

    let config = {
        headers: {
            "X-CSRF-TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY3MjUxODA0NCwianRpIjoiMjdlMTAzYjgtNTA0ZC00YmFiLWI5MWEtYzdhMzAzOWRhZjEyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MiwibmJmIjoxNjcyNTE4MDQ0LCJleHAiOjE2NzI1MjE2NDR9.ZqRFF6MFQUvsXhcZQFJusP5y-O3PTnC0agiZfjhTIhU"
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // setIsPending(true);

        // axios.post("http://127.0.0.1:5000/add", {
        //     playlist: `${URL}`,
        //     name: `${name}`
        // }, {
        // }).then(() => {
        //     alert("Sent Successfully!");
        //     setIsPending(false);
        // }
        // ). catch(err => console.log(err))

        actions.addPlaylist(URL,name).then(
            alert("Playlist Uploaded!")
        )
        console.log(store)
      
    }
    

    if (!store.token && !store.username) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="h-screen text-center">
            {/* <button>{store.username}</button> */}
            <h1 class="text-center mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl"><span class="text-transparent bg-clip-text bg-gradient-to-r to-blue-800 from-sky-300">ADD </span> YOUR <span class="text-transparent bg-clip-text bg-gradient-to-r to-blue-800 from-sky-300"> PLAYLIST</span></h1>
            <p className="font-['poppins']">To Submit A Playlist, Enter the URL of Spotify Playlist Below</p>
            <form onSubmit={handleSubmit}>
            <label for="default-input" class=" block mb-2 text-sm font-medium text-gray-900 dark:text-white"></label>
            <div className=" grid grid-cols-2 mx-auto">
                <input class="text-center mr-5 shadow appearance-none border rounded-full w-400 py-2 px-20 text-gray-700 focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Playlist URL"
                    required
                    value={URL} 
                    onChange={(e) => setURL(e.target.value)}/>
                    
 <input class="text-center mr-5 shadow appearance-none border rounded-full w-155 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Name Of Playlist"
                    required
                    value={name} 
                    onChange={(e) => setName(e.target.value)}/>
                    </div>
                   { !isPending && <button class="text-center mt-2 mx-auto text-gray-900 bg-blue-200 border border-blue-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 mx-auto dark:bg-blue-900 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
 Submit!</button>}
 { isPending && <button disabled class="text-center mt-2 mx-auto text-gray-900 bg-blue-200 border border-blue-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 mx-auto dark:bg-blue-900 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
 Submitting..</button>}
 
 <p className="mt-10 underline font-['poppins'] font-bold antialiased">Instructions</p>

<div className="grid grid-cols-2">
 <img className="mx-auto my-3 w-4/5 rounded" src={HowToImage}></img>
 <img className="mx-auto my-3 w-4/5 rounded" src={AddPLAYLIST}></img>
 </div>
            </form>
            <Link to="/playlists">
            <button type="button" class="flex flex-col  text-gray-900 bg-blue-200 border border-blue-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 mx-auto dark:bg-blue-900 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">View Your Added Playlist!</button>
            </Link>
        </div>
        
    )
}

export default AddPlaylist