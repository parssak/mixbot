import React from 'react';
import '../css_files/Queue.scss';

const QueueBox = props => {

    return (
        <div className="queue">
            {
                props.items.map((item, idx) =>
                    <div className={"entry"} id={idx}>
                        {item.songName} by {item.songArtists[0].name}
                    </div>)
            }
        </div>


    );
}

export default QueueBox;