import React, {useState, useEffect} from 'react';
import './css_files/App.css';
import TrackSelector from "./TrackSelector";

function App() {
    return(
        <div className={"body"}>
            <div className={"title"}>
                MIXBOT
                 <div className={"credits"}>
                    An Open Source project by Parssa Kyanzadeh
                 </div>
            </div>
            <TrackSelector/>
        </div>
    );
}
export default App;
