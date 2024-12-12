import React from 'react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';




const Card = (props) => {
  const [imageURL, setImage] = useState('')

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/getImage/${props.id}`, {
        'method': 'GET',
        headers: {
          'Content-Type': 'applications/json'
        }
      })
      .then(resp => resp.json())
      .then(resp => 
        setImage(resp))
      .catch(error => console.log(error))
  
  }, [])


    return (
      
      <div class="flex-2 rounded overflow-hidden shadow-lg w-95 m-5">
      <img class="w-full" src={imageURL} alt="Mountain"></img>
      <div class="px-4 py-4">
        <div class="font-bold text-xl mb-2">{props.name}</div>
        <p className='font-light text-sm mx-auto'>Posted by {props.username}</p>
        <p className='font-light text-sm mx-auto'>Likes: {props.likes}</p>

        

      </div>
    </div>
    )
}

export default Card