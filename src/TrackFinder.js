import React, {useEffect, useState} from 'react';
import youtubeApi from './api/youtube'
import videoDetailFinder from './api/youtubeVideoContent'
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import $ from 'jquery';

function TrackFinder({name, artists, duration_ms}) {

    const [songName, setSongName] = useState(name);
    const [songArtists, setSongArtists] = useState([]);
    const [duration, setDuration] = useState(duration_ms);
    const [chosenVideoID, setChosenVideoID] = useState("");

    function createSearchQuery() {
        console.log("creating search query...")
        console.log("songName is:" + songName)

        let artistNames = [];
        artists.forEach(e => {
            const thisName = e.name;
            if (thisName) {
                artistNames.push(thisName)
            }
        });
        // console.log(artistNames);
        // console.log("songArtists are:")
        // setSongArtists(artistNames)
        let searchQuery = songName + " ";
        // artistNames.forEach(e => { todo this doesn't work
        //     console.log(e);
        //     searchQuery.concat(e)
        // }); //
        console.log("SEARCH QUERY: "+searchQuery);
        return searchQuery;
    }


    async function videosSearch(search) {
        console.log("entered func videosSearch")
        const response = await youtubeApi.get("/search", {
            params:{
                q:search
            }
        })
        return response;
    }

    async function videoDetail(videoID) {
        // console.log("entered func videoDetail")
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
        setChosenVideoID('');
        // search youtube
        videosSearch(search).then(e => {
            const videoList = e.data.items;
            console.log("00-----------------");
            for (let video = 0;video < videoList.length; video++) {
                console.log(videoList[video].id.videoId)
                videoDetail(videoList[video].id.videoId).then(a => {
                    const thisDur = toMilli(a.data.items[0].contentDetails.duration);
                    // console.log(thisDur);
                    console.log("checking this one: -> " + Math.abs(duration - thisDur));
                    if (Math.abs(duration - thisDur) <= 1000) {
                        console.log("set this one!")
                        setChosenVideoID(videoList[video].id.videoId);
                    }
                })
                if (chosenVideoID) {
                    console.log("got songid of: " + songID)
                    break;
                }
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

    useEffect(() => {
        console.log("entered here!!!")
        if (chosenVideoID) {
            console.log("its this: "+chosenVideoID);
            videoIDtoMP3(chosenVideoID);
        }

    }, [chosenVideoID])

    function videoIDtoMP3(videoID) {
        console.log("entered here--------------------------------------------")
        //https://www.npmjs.com/package/ytdl-core
        $.get("https://www.yt-download.org/@api/button/" + videoID, function (data) {
            console.log(data)
        })
    }

    return (
        <div>
            <h1>{songName}</h1>
            <h2>{duration}</h2>
            <button onClick={getVideos}>
                Search for song
            </button>
        </div>
    );
}

export default TrackFinder;