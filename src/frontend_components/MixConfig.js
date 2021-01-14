import React from 'react'

export default function MixConfig() {
    return (
        <div className="queue-header" style={{ flexGrow: 1 }}>
            <h2>MIX SETTINGS</h2>
            <div className="queue">
                <div className={"entry"}>
                    <button>Play/Pause</button>
                    <p>Mix Lengths</p>
                    <p>Master Volume</p>
                    <p>Current Mix</p>
                </div>
            </div>
        </div>
    )
}
