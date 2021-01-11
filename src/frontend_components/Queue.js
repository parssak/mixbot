import React from 'react';
import '../css_files/Queue.scss';

const QueueBox = props => {
    return (
        <div className="queue-header">
            <h2>UPCOMING TRACKS</h2>
            <div className="queue">
                {
                    props.items.map((item, idx) =>
                        <div className={"entry"} key={item.id}>
                            <p key={item.id + "text"}>{item.body.songName}</p>
                        </div>)
                }
            </div>
        </div>
    );
}

export default QueueBox;