import React from 'react';

const PlaylistList = ({playlistList=[]}) => {
    return (
        <>
            { playlistList.map((data,index) => {
                if (data) {
                    return (
                        <div key={data.name}>
                            <h1>{data.name}</h1>
                        </div>
                    )
                }
                return null
            }) }
        </>
    );
}

export default PlaylistList