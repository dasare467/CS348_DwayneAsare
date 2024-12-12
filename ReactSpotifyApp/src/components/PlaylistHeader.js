import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Credentials } from '../Credentials';
import { useParams } from 'react-router-dom';


const PlaylistHeader = props => {


    return (
        <div class="align-middle h-min">
            <div class=" m-3 p-2 bg-blue-800 rounded-full flex flex-col md:flex-row rounded border shadow shadow-lg">
            <img class="flex-2 bg-cover rounded w-25" src={props.image}></img>
            <div class="flex-1 bg-blue-800 w-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-center leading-normal">
                <div class="font-['Poppins'] text-black font-bold text-xl text-left mb-2 leading-tight">Name: {props.name}</div>
            </div>
            </div>
        </div>
    )
}

export default PlaylistHeader