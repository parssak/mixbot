import { useEffect, useState } from 'react';
import { Gateway } from './Gateway';
const liveServerBase = "https://stark-reef-17924.herokuapp.com/";
let gateway = new Gateway();
/**
 * This class handles finding a track based on song name, artists, and duration
 * and calls the { foundSong } prop when a song has been found.
 */


let lastChosenID = "";
let fromDatabase = false;
let intervalCall;
let waitingForDownload = false;

export default function TrackFinder({ trackDetail, foundSong, cantFind }) {
    const [chosenVideoID, setChosenVideoID] = useState("");
    const [songPath, setSongPath] = useState("");


    function createSearchQuery() {
        let artistNames = [];
        trackDetail.artists.forEach(e => {
            const thisName = e.name;
            if (thisName) {
                artistNames.push(thisName)
            }
        });
        let searchQuery = trackDetail.name + " by " + artistNames[0];
        return searchQuery;
    }


    async function videosSearch(search) {
        const response = await gateway.getYoutubeList(search, trackDetail.duration_ms)
        return response;
    }

    /**
     * Searches YouTube for song using search query, breaks when found is song
     * @param searchQuery
     * @returns {Promise<void>}
     */
    async function getYoutubeVideo(searchQuery) {
        videosSearch(searchQuery).then(async e => {
            if (e.data) {
                setChosenVideoID(e.data);
            } else {
                let whitelistObj = {
                    songID: trackDetail.id,
                    songName: trackDetail.name,
                    songArtists: trackDetail.artists,
                    expectedDuration: trackDetail.duration_ms,
                }
                await gateway.addToWhitelist(whitelistObj);
                cantFind(false);
            }
        })
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

    useEffect(() => {
        async function findYoutubeID() {
            const result = await gateway.checkReferenceDB(trackDetail.id);
            lastChosenID = "";
            if (result === "") {
                const whitelistResult = await gateway.checkWhitelistDB(trackDetail.id);
                if (whitelistResult === "") {
                    fromDatabase = false;
                    const search = createSearchQuery();
                    await getYoutubeVideo(search);
                } else {
                    cantFind(true);
                }
            } else {
                fromDatabase = true;
                setChosenVideoID(result.videoID);
            }
        }
        if (trackDetail) findYoutubeID();
    }, [trackDetail]);

    async function videoIDtoMP3(videoID) {
        // let recievedPath = null;
        gateway.getAudioPath(videoID).then(res => {
            setSongPath(liveServerBase + videoID + ".mp3");
        })
    }

    useEffect(() => {
        if (songPath !== "" && !intervalCall) {
            console.log("calling the interval");
            intervalCall = setInterval(async function () {
                let res = await doesFileExist(chosenVideoID);
                if (res) {
                    submitSong();
                }
            }, 7000)
        } else {
            console.log("didn't call the interval", songPath, intervalCall);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [songPath]);

    function submitSong() {
        console.log("clearing the interval!");
        clearInterval(intervalCall);
        intervalCall = null;
        setSongPath("");
        foundSong(trackDetail.name, trackDetail.artists, trackDetail.duration_ms, songPath, trackDetail.id, trackDetail.album.images[1], chosenVideoID, fromDatabase); // ! CHANGED THIS FROM PARAM TO CHOSENVIDEOID
    }
    return null;
}


async function doesFileExist(videoID) {
    let res = await gateway.getAudioLoaded(videoID);
    return res.isLoaded;
}