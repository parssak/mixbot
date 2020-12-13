import React, {useEffect, useState} from 'react';
import youtubeApi from './api/youtube'
import videoDetailFinder from './api/youtubeVideoContent'
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
// TODO MAKE
function TrackFinder({name, artists, duration_ms}) {

    const [songName, setSongName] = useState(name);
    const [songArtists, setSongArtists] = useState(artists);
    const [duration, setDuration] = useState(duration_ms);
    const [searchResults, setSearchResults] = useState([]);

    function createSearchQuery() {
        let artistNames = [];
        songArtists.forEach(e => artists.push(e.name));
        console.log(artists);
        let searchQuery = songName + " ";
        artistNames.forEach(e => console.log(e)); //searchQuery.concat(e + ' ')
        console.log("SEARCH QUERY: "+searchQuery);
        return searchQuery;
    }


    async function videosSearch(search) {
        console.log("entered func")
        const response = await youtubeApi.get("/search", {
            params:{
                q:search
            }
        })
        return response;
    }

    async function videoDetail(videoID) {
        console.log("entered func")
        const response = await videoDetailFinder.get("/videos", {
            params:{
                id:videoID
            }
        })
        return response;
    }


    async function getVideos() {
        const search = createSearchQuery();
        console.log("duration prop is:" + duration)
        let songID = "NOTFOUND";
        // search youtube
        videosSearch(search).then(e => {
            const videoList = e.data.items;
            // console.log(e.data.items);
            videoList.forEach(e => {
                console.log(e.id.videoId)
                videoDetail(e.id.videoId).then(a => {
                    const thisDur = toMilli(a.data.items[0].contentDetails.duration);
                    console.log(thisDur);
                    console.log(Math.abs(duration - thisDur));
                    if (Math.abs(duration - thisDur) <=1000) {
                        songID = e.id.videoId;
                    }
                })
                // console.log(e.id.videoId);
                //
                // TODO left off here
            })
            if (songID !== "NOTFOUND") {
                console.log("got songid of: " + songID)
            } else {
                console.log("couldnt find song id")
            }
        })
        // console.log(videos.data.items);
    }

    function toMilli(ISO) {
        return toSeconds( parse(ISO) ) * 1000;
    }


    useEffect(() => {
        return () => {
            const searchQuery = createSearchQuery();
            console.log("searchquery is: " +searchQuery);
            // Search for songs
        };
    }, []);

    return (
        <div>
            <h1>Hello world</h1>
            <h3>hi how are you</h3>
            <h2>very cool</h2>
            <button onClick={getVideos}>
                Search for song
            </button>
        </div>
    );
}

export default TrackFinder;