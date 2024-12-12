import React, { useState } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import { Link } from "react-router-dom";



const GenerateReport = () => {
  const [filters, setFilters] = useState({
    playlistName: '',
    likes: '',
    dateRange: '',
    username: '',
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const query = new URLSearchParams({
      playlist_name: filters.playlistName || '',
      likes: filters.likes || '',
      date_range: filters.dateRange || '',
      username: filters.username || '',
    }).toString();

    try {
      const response = await axios.get(`http://127.0.0.1:5000/filter_playlists?${query}`);
      console.log(query)
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-scree text-gray-900 dark:text-white"> {/* Updated background color */}
      <header className="text-center pt-6 my-5">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold">
          Generate Report
        </h1>
      </header>

      <form
        className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4"
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="playlistName" className="block text-sm font-medium">
            Playlist Name
          </label>
          <input
            type="text"
            id="playlistName"
            name="playlistName"
            placeholder="Enter playlist name"
            className="mt-1 block w-full rounded-md border-black border-2 h-10 pl-2 bg-white text-gray-900 "
            value={filters.playlistName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="likes" className="block text-sm font-medium">
            Likes
          </label>
          <input
            type="number"
            id="likes"
            name="likes"
            placeholder="Enter minimum likes"
            className="mt-1 block w-full rounded-md border-black border-2 h-10 pl-2 bg-white text-gray-900 "
            value={filters.likes}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium">
            Date Range
          </label>
          <input
            type="text"
            id="dateRange"
            name="dateRange"
            placeholder="YYYY-MM-DD to YYYY-MM-DD"
            className="mt-1 block w-full rounded-md border-black border-2 h-10 pl-2 bg-white text-gray-900 "
            value={filters.dateRange}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter username"
            className="mt-1 block w-full rounded-md border-black border-2 h-10 pl-2 bg-white text-gray-900 "
            value={filters.username}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-400 to-blue-900 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          Submit
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-center text-2xl font-semibold">Results</h2>
        {loading ? (
          <p className="text-center mt-4">Loading...</p>
        ) : results.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {results.map((playlist) => (
              <div key={playlist.id}>
                {/* Use the reusable Card component */}
                <Link to ={`/playlists/${playlist.id}`}>
                <Card
                  name={playlist.name}
                  id={playlist.id}
                  username={playlist.username}
                  likes={playlist.likes}
                />
                </Link>

              </div>
            ))}
          </div>
        ) : (
          <p className="text-center mt-4">No playlists found</p>
        )}
      </section>
    </div>
  );
};

export default GenerateReport;
