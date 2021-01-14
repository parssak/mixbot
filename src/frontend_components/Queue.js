import React from 'react';
import '../css_files/Queue.scss';

const QueueBox = props => {
    return (
        <>
            {props.items.length !== 0 &&
                <div className="queue-header">
            
                    <h2>TRACKLIST</h2>
                    <div className="queue" style={{ flexBasis: 'content', flexGrow: 1 }}>
                        {
                            props.items.map((item, idx) =>
                                <div className={"entry"} key={item.id} style={{ flexGrow: 1 }}>
                                    <p key={item.id + "text"}>{item.body.songName}</p>
                                </div>)
                        }
                    </div>
                </div>
            }
            </>
    );
}

export default QueueBox;