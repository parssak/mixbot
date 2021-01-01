import React, {useEffect, useState} from 'react';
import Deck from "./Deck";
let tracklist = [];
let upcomingSongs = [];
let alreadyPlayed = [];
// --- Global Functions ---
export function addToQueue(songName, songArtists, duration_ms, songURL, analysis) {
    const newSong = {
        songName: songName,
        songArtists: songArtists,
        duration_ms: duration_ms,
        songURL: songURL,
        songAnalysis: analysis
    }
    console.log(songURL);
    tracklist.push(newSong);
    upcomingSongs.push(newSong);
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

export default function TrackPlayer() {
    const [deck1Song, setDeck1Song] = useState('');
    const [deck2Song, setDeck2Song] = useState('');
    
    const [deck1BPM, setDeck1BPM] = useState(0);
    const [deck2BPM, setDeck2BPM] = useState(0);
    
    const [deck1playback, setDeck1playback] = useState(1);
    const [deck2playback, setDeck2playback] = useState(1);

    const [deck1prepared, setDeck1prepared] = useState(false);
    const [deck2prepared, setDeck2prepared] = useState(false);

    const [deck1Playing, setDeck1Playing] = useState(false);
    const [deck2Playing, setDeck2Playing] = useState(false);

    function loadTrackA() {
        console.log("entered");
        let newSong = loadTrack();
        setDeck1prepared(false);
        if (newSong !== null) {
            setDeck1BPM(Math.round(newSong.songAnalysis.data.track.tempo)) // terribly sus
            if (deck2Song === '') {
                setDeck1playback(1);
            } else {
                if (deck2BPM !== 0) {
                    // console.log("deck1bpm is:",newSong.songAnalysis.data.track.tempo,"and","deck2bpm is:",deck2BPM)
                    let ratio = (deck2BPM/newSong.songAnalysis.data.track.tempo).toPrecision(5);
                    setDeck1playback(ratio);
                } else {
                    setDeck1playback(1);
                }
            }
            setDeck1Song(newSong)
        }
    }

    function loadTrackB() {
        let newSong = loadTrack();
        setDeck2prepared(false);
        if (newSong !== null) {
            setDeck2BPM(Math.round(newSong.songAnalysis.data.track.tempo)) // terribly sus
            if (deck1Song === '') {
                setDeck2playback(1);
            } else {
                if (deck1BPM !== 0) {
                    // console.log("deck2bpm is:",newSong.songAnalysis.data.track.tempo,"and","deck1bpm is:",deck1BPM)
                    let ratio = (deck1BPM/newSong.songAnalysis.data.track.tempo).toPrecision(5);
                    setDeck2playback(ratio);
                } else {
                    setDeck2playback(1);
                }
            }
            setDeck2Song(newSong)
        }
    }

    function loadTrack() {
        let nextSong = null;
        if (upcomingSongs.length !== 0) {
            nextSong = upcomingSongs[0];
            alreadyPlayed.push(nextSong);
            upcomingSongs.shift();
        }
        return nextSong;
    }

    function deckOneReady() {
        if (!deck1prepared) {
            setDeck1prepared(true);
            console.log("D1READY");  
            if (!deck2Playing) {
                console.log("telling deck 1 to play");
                setDeck1Playing(true);
            }
        }
    }

    function deckTwoReady() {
        if (!deck2prepared) {
            setDeck2prepared(true);
            console.log("D2READY");
            if (!deck1Playing) {
                console.log("telling deck 2 to play");
                setDeck2Playing(true);
            }
        }        
    }

    return (
        <div className={"djboard"}>
            <div className={"boardpanel"}>
                {deck1BPM !== 0 && <h1>DECK A BPM: {deck1BPM} RATE:{deck1playback}</h1>}
                {tracklist.length !== 0 && <button className={"loadbutton"} onClick={() => loadTrackA()}>Load Track A</button>}
                {deck1Song !== '' && <Deck thisSong={deck1Song.songURL} songName={deck1Song.songName} songArtist={deck1Song.songArtists[0].name}
                    songAnalysis={deck1Song.songAnalysis} playbackRate={deck1playback} prepared={deckOneReady()} play={deck1Playing}/>}
            </div>
            <div className={"boardpanel"}>
                {deck2BPM !== 0 && <h1>DECK B BPM: {deck2BPM} RATE:{deck2playback}</h1>}
                {tracklist.length !== 0 && <button className={"loadbutton"} onClick={() => loadTrackB()}>Load Track B</button>}
                {deck2Song !== '' && <Deck thisSong={deck2Song.songURL} songName={deck2Song.songName} songArtist={deck2Song.songArtists[0].name}
                    songAnalysis={deck2Song.songAnalysis} playbackRate={deck2playback} prepared={deckTwoReady()} play={deck2Playing}/>}
            </div>
        </div>
    );
}