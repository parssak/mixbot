import React, {useState} from 'react';
import TrackSelector from "./TrackSelector";
import TrackPlayer from "./TrackPlayer";
import QueueBox from "./frontend_components/Queue";
import Brain from "./Brain";

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
        nextSong = upcomingSongs[0];
        alreadyPlayed.push(nextSong);
        upcomingSongs.shift();
    }
    return nextSong;
}

export function nextSongInQueue() {
    // console.log("next song in queue is:", upcomingSongs[0]);
    return upcomingSongs[0] || null;
}

export const thoughtType = {
    NEUTRAL: 1,
    SUCCESS: 2,
    FAILURE: 3,
}

export default function Mixbot() {
    
    const [thoughts, setThoughts] = useState([]);

    function newThought(input, type=thoughtType.NEUTRAL) {
        console.log("1. new thought added",input);
        setThoughts([...thoughts, { id: "THOUGHT-" + thoughts.length, body: input, type: type }]);
        console.log("2. new thought added", thoughts);
    }

    function addToQueue(songName, songArtists, duration_ms, songURL, analysis, trackImage) {
        const newSong = {
            songName: songName,
            songArtists: songArtists,
            duration_ms: duration_ms,
            songURL: songURL,
            songAnalysis: analysis,
            trackImage: trackImage
        }
        console.log(analysis);
        tracklist.push(newSong);
        upcomingSongs.push(newSong);
        
        const think = `Added ${songName} to the tracklist`;
        newThought(think, thoughtType.SUCCESS);
    }

    return (
        <>
            <TrackPlayer />
            <Brain decisions={thoughts} />
            {upcomingSongs.length == 0 ? null :
                <div className="song-queue">
                    <h2>UPCOMING TRACKS</h2>
                    <QueueBox items={upcomingSongs} />
                </div>
            }
            <TrackSelector newThought={newThought} addToQueue={addToQueue}/>
        </>
    )
}
