import React, { useEffect, useState } from 'react';
import youtubeApi from './api/youtube'
import videoDetailFinder from './api/youtubeVideoContent'
import { parse, end, toSeconds, pattern } from 'iso8601-duration';
import axios from 'axios';

const baseURL = 'http://localhost:8080';
/**
 * This class handles finding a track based on song name, artists, and duration
 * and calls the foundSong prop when a song has been found.
 *
 * @param name: Name of the Song
 * @param artists: An array of artist objects
 * @param duration_ms: The duration of the song in milliseconds
 * @param foundSong: A prop that gets called when song has been found
 * @param trackID: id of the spotify song
 */
let lastChosenID = "";
let fromDatabase = false;
export default function TrackFinder({ name, artists, duration_ms, foundSong, trackID, trackImage }) {

    // const [songName, setSongName] = useState(name);
    // const [songArtists, setSongArtists] = useState(artists);
    // const [duration, setDuration] = useState(duration_ms);
    const [chosenVideoID, setChosenVideoID] = useState("");

    function createSearchQuery() {
        let artistNames = [];
        artists.forEach(e => {
            const thisName = e.name;
            if (thisName) {
                artistNames.push(thisName)
            }
        });
        let searchQuery = name + " by " + artistNames[0];
        return searchQuery;
    }


    async function videosSearch(search) {
        const response = await youtubeApi.get("/youtubeSearch", { // TODO CHANGE THIS TO SERVER
            params: {
                q: search
            }
        })
        return response;
    }

    async function videoDetail(videoID) {
        const response = await videoDetailFinder.get("/youtubeDetail", {
            params: {
                id: videoID
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
            const videoList = e.data.items;                                                     // a list of videos                 
            for (let video = 0; video < videoList.length; video++) {                            // for each video in the videoList...
                console.log(">>>>>>>>", chosenVideoID, "<<<<<<<<<");
                const thisDetails = await videoDetail(videoList[video].id.videoId);             // Get details...
                const thisDur = toMilli(thisDetails.data.items[0].contentDetails.duration);     // Get duration from details...
                if (Math.abs(duration_ms - thisDur) <= 1000) {                                     // If the duration is what we're looking for...
                    console.log(">>>>>>>> BINGO! <<<<<<<<<");
                    setChosenVideoID(videoList[video].id.videoId); // TODO FIX THIS OMG THIS IS AN ABSOLUTE ABUSE OF STATE.
                    break;
                }
            }
        })
    }

    /**
     * Helper function for converting ISO8 8601 time to milliseconds
     * @param ISO: ISO time
     * @returns {the ISO time in milliseconds}
     */
    function toMilli(ISO) {
        return toSeconds(parse(ISO)) * 1000;
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

        if (chosenVideoID && lastChosenID === "") {
            lastChosenID = chosenVideoID;
            videoIDtoMP3(chosenVideoID);
        }

    }, [chosenVideoID])

    useEffect(() => {          // TODO FIX WHEN AVAILABLE
        // setSongArtists(artists);
        // setSongName(name);
        // setDuration(duration_ms);
        console.log("use effect for checking entereed");
        async function findYoutubeID() {
            console.log("entered async bit");
            const result = await checkDatabase();
            lastChosenID = "";
            if (result === "") {
                console.log("Going to find the song");
                fromDatabase = false;
                const search = createSearchQuery();
                await getYoutubeVideo(search);
            } else {
                console.log("Got it from the DB!");
                fromDatabase = true;
                setChosenVideoID(result.videoID); 
            }
        }

        findYoutubeID();

    }, [name, artists, duration_ms]);

    async function checkDatabase() { // TODO MOVE THIS INTO IT'S OWN CLASS
        let result = null;
        if (trackID) {
            result = await axios.get(baseURL + '/checkForEntry', {
                params:
                {
                    data: trackID
                }
            });
            console.log(">>> (TRACKFINDER): GOT", result);
        }
        return result.data;
    }

    async function videoIDtoMP3(videoID) { 
        videoDetailFinder.get('/youtubeMp3', {
            params: {
                id: videoID
            }
        }).then(response => {
            let audioFormats = response.data;
            foundSong(name, artists, duration_ms, audioFormats[0].url, trackID, trackImage, videoID, fromDatabase); // ! ADD FROMDATABASE
            setChosenVideoID("");
        });
    }

    return null;
}