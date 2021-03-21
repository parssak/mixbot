import React, { useState } from 'react';
import TrackSelector from "./TrackSelector";
import TrackPlayer from "./TrackPlayer";
import QueueBox from "./frontend_components/Queue";
import Brain from "./Brain";
import axios from 'axios';
import MixConfig from './frontend_components/MixConfig';

let tracklist = [];
let upcomingSongs = [];
let alreadyPlayed = [];

const addSongRefURL = 'http://localhost:8080/addReference'

// --- Global Functions ---
export function trackAlreadyIn(songID) { // todo converting this
    for (const trackObj of tracklist) {
        if (trackObj.songID === songID) {
            return true;
        }
    }
    return false;
}

export function loadTrack() {
    let nextSong = null;
    if (upcomingSongs.length !== 0) {
        nextSong = upcomingSongs[0].body;
        alreadyPlayed.push(nextSong);
        upcomingSongs.shift();
    }
    return nextSong;
}

export function nextSongInQueue() {
    return upcomingSongs[0] || null;
}

export function tracklistSize() {
    return tracklist.length;
}

export const thoughtType = {
    NEUTRAL: 1,
    SUCCESS: 2,
    FAILURE: 3,
    MIX: 4
}

let currMixType = null;

export default function Mixbot() {
    const [thoughts, setThoughts] = useState([]);
    const [mixChosen, setMixChosen] = useState(false);
    const [masterPlay, setMasterPlay] = useState(true);

    function newThought(input, type = thoughtType.NEUTRAL) {
        let shouldShow = true;
        if (thoughts.length > 0 && thoughts[0].body === input) {
            shouldShow = false;
        }
        setThoughts([{ id: "THOUGHT-" + thoughts.length, body: input, type: type, display: shouldShow }, ...thoughts]);
    }

    /**
     * 
     * @param {*} songName: name of song
     * @param {*} songArtists : array of artists of song
     * @param {*} duration_ms: duration in ms 
     * @param {*} songURL: url to the temp reference link 
     * @param {*} analysis: raw spotify analysis 
     * @param {*} trackImage: img of album art 
     * @param {*} songID:  ID OF THE SPOTIFY SONG
     * @param {*} videoID:  ID OF THE CORRESPONDING YT ID
     * @param {boolean} fromDatabase: true if fetched yt id from database
     */
    async function addToQueue(songName, songArtists, duration_ms, songURL, analysis, trackImage, songID, videoID, fromDatabase) {
        console.log("Called addToQueue for", songName);
        if (trackAlreadyIn(songID)) {
            console.log(songName, " was already in tracklist!");
            return;
        }

        if (analysis !== "NOTFOUND") {
            if (!fromDatabase) {
                console.log("Not in db yet, adding it...");
                let correctedArtists = [];
                songArtists.forEach(artist => correctedArtists.push(artist.name));

                let songRefEntry = {
                    songID: songID, // spotify id
                    videoID: videoID, // youtube videoID
                    name: songName,
                    artists: correctedArtists,
                    duration: duration_ms,
                }
                // addSongRefDB(songRefEntry);
            }
        } else {
            console.log("analysis was not found!");
        }

        const newSong = {
            songName: songName,
            songArtists: songArtists,
            duration_ms: duration_ms,
            songURL: songURL,
            songAnalysis: analysis,
            trackImage: trackImage
        }
        console.log("added new song:", fromDatabase)
        // console.log(">>>(MIXBOT): NEW SONG IS:", newSong);
        // console.log(">>>(MIXBOT): ANALYSIS:", analysis);
        let packageSong = { id: "tracklist" + tracklist.length, body: newSong, songID: songID }
        console.log("packaged song");
        // console.log(">>>(MIXBOT): PACKAGED SONG:", packageSong);
        tracklist.push(packageSong);
        
        // console.log(">>>(MIXBOT): ADDED TO TRACKLIST:", tracklist);
        upcomingSongs.push(packageSong);
        console.log("pushed to tracklist and upcoming songs");
        // console.log(">>>(MIXBOT): ADDED TO UPCOMING SONGS:", upcomingSongs);
        const think = `Added ${songName} to the tracklist`;
        // console.log(">>>(MIXBOT): ABOUT TO THINK:", think);
        newThought(think, thoughtType.NEUTRAL);
        console.log("reached end of function");
    }

    // function addSongRefDB(entry) {
    //     axios.get(addSongRefURL, {
    //         params: { data: entry }
    //     });
    // }

    function choseMix(mixType) {
        const think = "Selected " + mixType + ", beginning mix";
        newThought(think, thoughtType.SUCCESS);
        currMixType = mixType;
        setMixChosen(true);
    }

    function hitMasterPlay() {
        console.log("hit master play");
        setMasterPlay(!masterPlay);
        return masterPlay;
    }

    return (
        <>
            <div className="mixbot-body">
                <TrackPlayer newThought={newThought} masterPlay={masterPlay} />
                <div className="mixbot-dropdowns">
                    <Brain decisions={thoughts} mixType={currMixType} />
                    <QueueBox items={tracklist} />
                    <MixConfig hitPause={hitMasterPlay} />
                </div>
            </div>
            <div style={{ display: mixChosen ? 'none' : 'inherit' }}>
                <TrackSelector
                    addToQueue={addToQueue}
                    addMoreSongs={upcomingSongs.length < 1}
                    newThought={newThought}
                    mixChosen={choseMix}
                />
            </div>

        </>
    )
}
