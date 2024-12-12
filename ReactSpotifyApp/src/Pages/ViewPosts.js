import React, { useContext } from "react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Credentials } from "../Credentials";
import Playlist from "../components/Playlist";
import { Link } from "react-router-dom";
import PlaylistDetails from "./PlaylistDetails";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import { redirect } from "react-router-dom";

const UserAccount = () => {
  const spotify = Credentials();

  const { store, actions } = useContext(Context);
  const [confirmPassword, setconfirmPassword] = useState("");
  const [image, setImage] = useState("");
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const user = store.username;
  const [playlists, setPlaylists] = useState([])

  useEffect(() => {
    // Fetch playlists initially
    const fetchPlaylists = async () => {
      const resp = await actions.viewPlaylists();
      setPlaylists(resp);
    };

    fetchPlaylists();
  }, [actions]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this playlist?");
    if (confirmed) {
      const success = await actions.deletePlaylist(id);
      if (success) {
        alert("Playlist deleted");
        const updatedPlaylists = await actions.viewPlaylists();
        setPlaylists(updatedPlaylists);
      } else {
        alert("Failed to delete playlist");
      }
    }
  };

  const handleEdit = async (id) => {
    const newName = prompt("Enter the new name for the playlist:");

    // Check if the user canceled the prompt
    if (newName === null) {
      return; // Exit the function if the prompt was canceled
    }

    const successfullyEdited = await actions.editPlaylistName(id, newName);

    if (successfullyEdited) {
      alert("Playlist edited!");
      const updatedPlaylists = await actions.viewPlaylists();
      setPlaylists(updatedPlaylists);     
    }
    else {
      alert("Failed to delete playlist");
    }

  }

  console.log(playlists)

  return (
    <div clasName="">
      <div className="m-auto">
        <h1 class="text-center pt-6 my-5 mb-4 text-8xl font-extrabold text-gray-900 dark:text-white md:text-8xl lg:text-9xl">
          <span class="text-transparent bg-clip-text bg-gradient-to-r to-blue-900 from-sky-400">
            PUT{" "}
          </span>{" "}
          {"wej"}{" "}
          <span class="text-transparent bg-clip-text bg-gradient-to-r to-blue-900 from-sky-400">
            {" "}
            ON
          </span>
        </h1>
        <p class="mb-2 text-center text-lg font-['Poppins'] text-black lg:text-xl">
          Uploaded Playlists
        </p>
        
        <div className=" m-auto  flex flex-col place-content-center">
        {playlists.map((p, index) => (
    <div
      key={index}
      onClick={() => navigate(`/playlists/${p.id}`)} // Click anywhere on the card to navigate
      className="p-4 mb-4 border border-gray-300 rounded-lg shadow-md bg-white max-w-md mx-auto cursor-pointer"
    >
      <div>
        <p className="text-center text-lg font-['Poppins'] text-black lg:text-xl">
          {p.name}
        </p>
      </div>
      <div className="flex justify-between mt-4 gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents card navigation
            handleEdit(p.id);
          }}
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-700"
        >
          Edit Name
        </button>  
              <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents card navigation
            console.log(`Viewing playlist: ${p.id}`);
          }}
          className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-700"
        >
          <a href={`/playlists/${p.id}`}>
          View
          </a>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents card navigation
            handleDelete(p.id);
          }}
          className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-700"
        >
          Delete
        </button>

      </div>
    </div>
  ))}
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
