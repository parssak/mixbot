import React, {useState, useEffect} from 'react';
import './css_files/App.css';
import TrackSelector from "./TrackSelector";

function App() {
    return(
        <div className={"body"}>
            <div className={"title"}>
                <h1>MIXBOT</h1>
                 <div className={"credits"}>
                    <h3>An Open Source project by Parssa Kyanzadeh</h3> 
                 </div>
            </div>
            <TrackSelector/>
        </div>
    );
}
export default App;
