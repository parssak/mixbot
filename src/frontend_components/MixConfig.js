import React, {useState} from 'react'


export default function MixConfig({ hitPause }) {
    const [isPaused, setisPaused] = useState(false);
    function playPause() {
        setisPaused(hitPause());
    }

    return (
        <div className="queue-header" style={{ flexGrow: 1 }}>
            <h2>MIX SETTINGS</h2>
            <div className="queue">
                <div className={"entry"}>
                    <button onClick={() => playPause()}>{isPaused ? "PLAY" : "PAUSE"}</button> 
                    <p>Mix Lengths (WIP)</p>
                    <p>Master Volume (WIP)</p>
                    <p>Current Mix (WIP)</p>
                </div>
            </div>
        </div>
    )
}
