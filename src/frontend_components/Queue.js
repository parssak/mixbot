import React from 'react';
import '../css_files/Queue.scss';

const QueueBox = props => {
    return (
        <div className="queue-header">
            <h2>UPCOMING TRACKS</h2>
            <div className="queue">
                {
                    props.items.map((item, idx) =>
                        <div className={"entry"} id={item.id}>
                            <p id={item.id + "text"}>{item.songName} by {item.songArtists[0].name}</p>
                        </div>)
                }
            </div>
        </div>
    );
}

export default QueueBox;