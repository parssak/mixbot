import React from 'react';

function Detail({artists, name, duration_ms}) {

    return (
        <div>
            <div>
                <label htmlFor={name}>
                    {name}
                </label>
            </div>
            <div>
                <label htmlFor={artists[0].name}>
                    {artists[0].name}
                </label>
            </div>
            <div>
                <label htmlFor={duration_ms}>
                    {duration_ms}
                </label>
            </div>
        </div>
    );
}
export default Detail;