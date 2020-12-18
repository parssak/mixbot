import React, {useState} from 'react';
let tracklist = [];
let currentSong = 0;
let audioElement = new Audio();

export function addToQueue(songName, songArtists, duration_ms, songURL, analysis) {
    const newSong = {
        songName: songName,
        songArtists: songArtists,
        duration_ms: duration_ms,
        songURL: songURL,
        songAnalysis: analysis
    }
    tracklist.push(newSong);
}

export function trackAlreadyIn(trackName) {
    console.log("checking if track is already in....", trackName);
    for (const trackObj of tracklist) {
        console.log(trackObj.songName)
        if (trackObj.songName === trackName)
            return true;
    }
    return false;
}

function playSong() {
    if (tracklist.length === 1 && audioElement.paused) {
        audioElement.load();
        audioElement = new Audio(tracklist[0].songURL)
    }
    if (audioElement.paused) {
        console.log("is paused")
        audioElement.play();
    } else {
        console.log("is playing")
        audioElement.pause();
    }
}

function loadNextSong() {
    audioElement.pause();
    audioElement.load();
    if (currentSong + 1 < tracklist.length) {
        currentSong += 1;
        setCurrentSong();
    }
}

function loadPreviousSong() {
    audioElement.pause();
    audioElement.load();
    if (currentSong - 1 >= 0) {
        currentSong -= 1;
        setCurrentSong();
    }
}

function setCurrentSong() {
    audioElement.pause();
    audioElement.src = tracklist[currentSong].songURL;
    audioElement.play();
}

function getCurrentSong() {
    return tracklist[currentSong];
}

export default function TrackPlayer() {
    const [trackName, setTrackName] = useState("");
    const [trackArtist, setTrackArtist] = useState("");


    function playTrack() {
        playSong();
        const currSong = getCurrentSong();
        if (currSong) {
            setTrackName(currSong.songName);
            setTrackArtist(currSong.songArtists[0].name);
        }
    }

    function nextTrack() {

    }

    return (
        <div>
            <button onClick={() => {playTrack()}}>PLAY SONG</button>
            <button onClick={() => {loadNextSong()}}>NEXT SONG</button>
            <button onClick={() => {loadPreviousSong()}}>PREVIOUS SONG</button>
            <h1>{trackName}</h1>
            <h1>{trackArtist}</h1>
        </div>);
}