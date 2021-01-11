import React from 'react'
import '../css_files/Queue.scss';

export default function Brain({ decisions }) {
    return (
        <div className="queue-header">
            <h2>MIXBOT BRAIN</h2>
            <div className="queue">
                {decisions.map(thought => (
                    <div className={"entry"} id={thought.id}>
                        <p id={thought.id + "thought"}>{thought.body}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
