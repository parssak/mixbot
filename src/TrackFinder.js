import React, {useEffect, useState} from 'react';
import youtubeApi from './api/youtube'
import videoDetailFinder from './api/youtubeVideoContent'
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import ytdl from "react-native-ytdl";

/**
 * This class handles finding a track based on song name, artists, and duration
 * and calls the foundSong prop when a song has been found.
 *
 * @param name: Name of the Song
 * @param artists: An array of artist objects
 * @param duration_ms: The duration of the song in milliseconds
 * @param foundSong: A prop that gets called when song has been found
 * @param trackID:
 */
let lastChosenID = "";
export default function TrackFinder({name, artists, duration_ms, foundSong, trackID}) {

    const [songName, setSongName] = useState(name);
    const [songArtists, setSongArtists] = useState(artists);
    const [duration, setDuration] = useState(duration_ms);
    const [chosenVideoID, setChosenVideoID] = useState("");

    function createSearchQuery() {
        console.log(" -- Entered createSearchQuery -- ")
        let artistNames = [];
        artists.forEach(e => {
            const thisName = e.name;
            if (thisName) {
                artistNames.push(thisName)
            }
        });
        let searchQuery = name + " by " + artistNames[0];
        console.log("SEARCH QUERY:",searchQuery);
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
        const response = await videoDetailFinder.get("/videos", {
            params:{
                id:videoID
            }
        })
        return response;
    }

    /**
     * Searches YouTube for song using search query, breaks when found is song
     * @param searchQuery
     * @returns {Promise<void>}
     */
    async function getYoutubeVideo(searchQuery) {
        videosSearch(searchQuery).then(async e => {
            const videoList = e.data.items;
            console.log("-- Entered getYoutubeVideo --");
            for (let video = 0; video < videoList.length; video++) {
                const thisID = await videoDetail(videoList[video].id.videoId);
                const thisDur = toMilli(thisID.data.items[0].contentDetails.duration);
                if (Math.abs(duration - thisDur) <= 1000) {
                    console.log(videoList[video]);
                    setChosenVideoID(videoList[video].id.videoId);
                    break;
                }
            }

        }).finally(async () => {
            if (chosenVideoID === "") {
                // console.log("could not find song");
            } else {
                // console.log("found song")
            }

        })
    }

    /**
     * Helper function for converting ISO8 8601 time to milliseconds
     * @param ISO: ISO time
     * @returns {the ISO time in milliseconds}
     */
    function toMilli(ISO) {
        return toSeconds( parse(ISO) ) * 1000;
    }

    /**
     * This effect triggers when the chosenVideoID is
     * found, and then get the URL for mp3 download
     *
     * Since this effect gets called over once for the
     * same video being found sometimes, it will not
     * convert the video to mp3 if it has already been
     * called once for this current song
     * >> “ "lastChosenID === "" ”
     */
    useEffect(() => {
        console.log("| got youtube video ID, effect triggered | ")
        if (chosenVideoID && lastChosenID === "") {
            lastChosenID = chosenVideoID;
            videoIDtoMP3(chosenVideoID);
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

    return null;
}