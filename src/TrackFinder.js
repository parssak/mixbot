import React, {useEffect, useState} from 'react';
import youtubeApi from './api/youtube'
import videoDetailFinder from './api/youtubeVideoContent'
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import ytdl from "react-native-ytdl";
import HttpsProxyAgent from 'https-proxy-agent';

// const proxy = 'http://user:pass@111.111.111.111:8080';
// const agent = HttpsProxyAgent(proxy);
let lastChosenID = "";
export default function TrackFinder({name, artists, duration_ms, foundSong, trackID}) {

    const [songName, setSongName] = useState(name);
    const [songArtists, setSongArtists] = useState([]);
    const [duration, setDuration] = useState(duration_ms);
    const [chosenVideoID, setChosenVideoID] = useState("");


    function createSearchQuery() { // TODO add a better search
        console.log(" -- Entered createSearchQuery -- ")
        let artistNames = [];
        artists.forEach(e => {
            const thisName = e.name;
            if (thisName) {
                artistNames.push(thisName)
            }
        });
        let searchQuery = songName + " ";
        console.log("SEARCH QUERY: "+searchQuery);
        return searchQuery;
    }


    async function videosSearch(search) {
        console.log("--- Entered videosSearch ---")
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
        videosSearch(searchQuery).then(async e => {
            const videoList = e.data.items;
            console.log("-- Entered getYoutubeVideo --");

            for (let video = 0; video < videoList.length; video++) {

                console.log(videoList[video])
                const thisID = await videoDetail(videoList[video].id.videoId);

                const thisDur = toMilli(thisID.data.items[0].contentDetails.duration);
                console.log("checking this one: -> " + Math.abs(duration - thisDur));
                if (Math.abs(duration - thisDur) <= 1000) {
                    console.log("set this one!")
                    console.log(videoList[video]);
                    setChosenVideoID(videoList[video].id.videoId);
                    break;
                }
            }
        })
    }

    function toMilli(ISO) {
        return toSeconds( parse(ISO) ) * 1000;
    }

    useEffect(() => {
        console.log("| got youtube video ID, effect triggered | ")
        if (chosenVideoID && lastChosenID === "") {
            lastChosenID = chosenVideoID;
            videoIDtoMP3(chosenVideoID);
        } else {
            console.log("stopping here!")
        }

    }, [chosenVideoID])

    useEffect(async () => {
        console.log("----- entered fx");
        setSongArtists(artists);
        setSongName(name);
        setDuration(duration_ms);
        lastChosenID = "";
        const search = createSearchQuery();
        await getYoutubeVideo(search);
    }, [name, artists, duration_ms]);

    async function videoIDtoMP3(videoID) {
        console.log("-- Entered videoIDtoMP3 --")
        await ytdl.getInfo(videoID, { quality: 'highestaudio'}).then(info => {
            let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            foundSong(songName, songArtists, duration, audioFormats[0].url, trackID);
            setChosenVideoID("");
        });
    }

    return(<>
        </>);
}