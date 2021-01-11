import React, {useState, useEffect} from 'react';
import './css_files/App.css';
import Mixbot from './Mixbot';

import axios from 'axios';

function App() {

    // function makeRequest() {
    //     console.log("boutta make request");
    //     axios.create({
    //         baseURL: 'http://localhost:8080',
    //         headers: {}
    //     }).get('/addEntry', {
    //         params: {
    //             songEntry: {
    //                 name: "AHA AHA AHA"
    //             }
    //         },
    //     })
    // }

    return(
        <div className={"body"}>
            <div className={"title"}>
                <h1>MIXBOT</h1>
                <div className={"credits"}>
                    {/* <button onClick={() => { makeRequest() }}>Make request</button> */}
                    <h3>An Open Source project by Parssa Kyanzadeh</h3> 
                 </div>
            </div>
            <Mixbot/>
        </div>
    );
}
export default App;
