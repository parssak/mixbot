import React, {useEffect, useState} from 'react';
import youtubeApi from './api/youtube'
import videoDetailFinder from './api/youtubeVideoContent'
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import ytdl from "react-native-ytdl";
import HttpsProxyAgent from 'https-proxy-agent';

const proxy = 'http://user:pass@111.111.111.111:8080';
const agent = HttpsProxyAgent(proxy);
let lastChosenID = "";
function TrackFinder({name, artists, duration_ms, foundSong}) {

    const [songName, setSongName] = useState(name);
    const [songArtists, setSongArtists] = useState([]);
    const [duration, setDuration] = useState(duration_ms);
    const [chosenVideoID, setChosenVideoID] = useState("");
    const [downloadedURL, setDownloadedURL] = useState("");

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

    async function getYoutubeVideo(searchQuery) {
        // search youtube
        videosSearch(searchQuery).then(e => {
            const videoList = e.data.items;
            console.log("00-----------------");
            for (let video = 0;video < videoList.length; video++) {
                console.log(videoList[video])
                videoDetail(videoList[video].id.videoId).then(a => {
                    const thisDur = toMilli(a.data.items[0].contentDetails.duration);
                    // console.log(thisDur);
                    console.log("checking this one: -> " + Math.abs(duration - thisDur));
                    if (Math.abs(duration - thisDur) <= 1000) {
                        console.log("set this one!")
                        console.log(videoList[video]);
                        setChosenVideoID(videoList[video].id.videoId);
                    }
                })
                if (chosenVideoID) {
                    break;
                }
            }
        })
    }

    async function getVideos() {
        lastChosenID = "";
        setDownloadedURL("");
        const search = createSearchQuery();
        console.log("duration prop is:" + duration)
        await getYoutubeVideo(search);
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
        console.log("got youtube video ID, entered here")
        if (chosenVideoID && lastChosenID === "") {
            console.log("its this: "+chosenVideoID);
            lastChosenID = chosenVideoID;
            videoIDtoMP3(chosenVideoID);
        }

    }, [chosenVideoID])

    useEffect(() => {
            setSongArtists(artists);
            setSongName(name);
            setDuration(duration_ms);
    }, [name, artists, duration_ms]);

    useEffect(() => {
        if (downloadedURL !== "") {
            foundSong(songName, downloadedURL);
            setDownloadedURL("");
        }
    }, [downloadedURL]);



    async function videoIDtoMP3(videoID) {
        console.log("entered here--------------------------------------------")
        await ytdl.getInfo(videoID, { quality: 'highestaudio'}).then(info => {
            let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            setDownloadedURL(audioFormats[0].url);
            console.log(downloadedURL);
        });
    }

    return (
        <div>
            <button onClick={getVideos}>
                Search for song with YouTube
            </button>
            {downloadedURL ? <button onClick={() => {
                window.open(downloadedURL)
            }}>GO TO SONG
            </button> : null}
        </div>
    );
}

export default TrackFinder;