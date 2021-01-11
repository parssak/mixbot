import React, {useState} from 'react';
import TrackSelector from "./TrackSelector";
import TrackPlayer from "./TrackPlayer";
import QueueBox from "./frontend_components/Queue";
import Brain from "./Brain";
import { Analyzer } from './helper_classes/Analyzer';

let tracklist = [];
let upcomingSongs = [];
let alreadyPlayed = [];

// --- Global Functions ---
export function trackAlreadyIn(trackName) {
    console.log("checking if track is already in....", trackName);
    for (const trackObj of tracklist) {
        console.log(trackObj.songName)
        if (trackObj.songName === trackName)
            return true;
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
    // console.log("next song in queue is:", upcomingSongs[0]);
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

    function newThought(input, type=thoughtType.NEUTRAL) {
        console.log("1. new thought added", input);
        let shouldShow = true;
        if (thoughts[thoughts.length - 1].body === input) {
            shouldShow = false;
        }
        setThoughts([...thoughts, { id: "THOUGHT-" + thoughts.length, body: input, type: type, display: shouldShow}]);
        console.log("2. new thought added", thoughts);
    }

    function addToQueue(songName, songArtists, duration_ms, songURL, analysis, trackImage) {

        if (analysis !== "NOTFOUND") {
            console.log(">> analysis was",analysis);
            let songData = analysis.data;
            console.log(">>> song data>>", songData);

            let analyzer = new Analyzer();
            let analyzedData = analyzer.analyzeSong(songData);
            analysis = {
                data: songData,
                analyzed: analyzedData
            };
            console.log(">> analysis now is", analysis);
        } 

        const newSong = {
            songName: songName,
            songArtists: songArtists,
            duration_ms: duration_ms,
            songURL: songURL,
            songAnalysis: analysis,
            trackImage: trackImage
        }
        
        console.log(analysis);
        let packageSong = { id: "tracklist" + tracklist.length, body: newSong }
        tracklist.push(packageSong);
        upcomingSongs.push(packageSong);
        
        const think = `Added ${songName} to the tracklist`;
        newThought(think, thoughtType.NEUTRAL);
    }

    return (
        <>
            <TrackPlayer newThought={newThought} />
            <div className="mixbot-dropdowns">
                <Brain decisions={thoughts} />
                {tracklist.length == 0 ? null : <QueueBox items={tracklist} />}
            </div>
            <TrackSelector addToQueue={addToQueue}/>
        </>
    )
}
