import React, { useState } from 'react';
import TrackSelector from "./TrackSelector";
import TrackPlayer from "./TrackPlayer";
import QueueBox from "./frontend_components/Queue";
import Brain from "./Brain";
import axios from 'axios';

let tracklist = [];
let upcomingSongs = [];
let alreadyPlayed = [];

const addSongRefURL = 'http://localhost:8080/addReference'

// --- Global Functions ---
export function trackAlreadyIn(trackName) {
    console.log(">>>>>>>>> CHECKING IF", trackName, "IS ALREADY IN TRACKLIST");
    for (const trackObj of tracklist) {
        if (trackObj.songName === trackName)
            console.log(">>>>>>>>> ",trackName, "IS ALREADY IN TRACKLIST");
            return true;
    }
    console.log(">>>>>>>>> ", trackName, "IS NOT NOT NOT NOT NOTALREADY IN TRACKLIST");
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

export default function Mixbot() {
    const [thoughts, setThoughts] = useState([]);

    function newThought(input, type = thoughtType.NEUTRAL) {
        // console.log("1. new thought added", input);
        let shouldShow = true;
        if (thoughts.length > 0 && thoughts[0].body === input) {
            shouldShow = false;
        }
        setThoughts([{ id: "THOUGHT-" + thoughts.length, body: input, type: type, display: shouldShow }, ...thoughts]);
        // console.log("2. new thought added", thoughts);
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

        // TODO MAKE THIS ONLY HAPPEN IF NOT FOUND IN DATABASE
        if (analysis !== "NOTFOUND") {
            if (!fromDatabase) {
                console.log("not in db yet, adding it...");

                let correctedArtists = [];
                songArtists.forEach(artist => correctedArtists.push(artist.name));

                let songRefEntry = {
                    songID: songID, // spotify id
                    videoID: videoID, // youtube videoID
                    name: songName,
                    artists: correctedArtists,
                    duration: duration_ms,
                }
                addSongRefDB(songRefEntry);
            } else {
                // console.log("got it from db!");
            }
          
            // Add it to the DB // todo
            // let databaseEntry = {
            // songID: songID,
            // songName: songName,
            // analyzed: analyzedData,
            // }

            // addTrackAnalysisDB(databaseEntry);

        }

        const newSong = {
            songName: songName,
            songArtists: songArtists,
            duration_ms: duration_ms,
            songURL: songURL,
            songAnalysis: analysis,
            trackImage: trackImage
        }
        // console.log(">>>(MIXBOT): NEW SONG IS:", newSong);
        // console.log(">>>(MIXBOT): ANALYSIS:", analysis);
        let packageSong = { id: "tracklist" + tracklist.length, body: newSong }
        // console.log(">>>(MIXBOT): PACKAGED SONG:", packageSong);
        tracklist.push(packageSong);
        // console.log(">>>(MIXBOT): ADDED TO TRACKLIST:", tracklist);
        upcomingSongs.push(packageSong);
        // console.log(">>>(MIXBOT): ADDED TO UPCOMING SONGS:", upcomingSongs);
        const think = `Added ${songName} to the tracklist`;
        // console.log(">>>(MIXBOT): ABOUT TO THINK:", think);
        newThought(think, thoughtType.NEUTRAL);
    }

    // function addTrackAnalysisDB(entry) {
    //     axios.create({
    //         baseURL: 'http://localhost:8080',
    //         headers: {}
    //     }).get('/addAnalysis', {
    //         params: {
    //             data: entry
    //         },
    //     })
    // }

    function addSongRefDB(entry) {
        axios.get(addSongRefURL, {
            params: { data: entry }
        });
    }


    return (
        <>
            <TrackPlayer newThought={newThought} />
            <div className="mixbot-dropdowns">
                <Brain decisions={thoughts} />
                {tracklist.length == 0 ? null : <QueueBox items={tracklist} />}
            </div>
            <TrackSelector addToQueue={addToQueue} addMoreSongs={upcomingSongs.length < 1} newThought={ newThought}/>
        </>
    )
}
