import React, { useEffect, useState } from 'react';
import Deck from "./Deck";
let tracklist = [];
let upcomingSongs = [];
let alreadyPlayed = [];

const silenceTrack = "https://raw.githubusercontent.com/anars/blank-audio/master/1-second-of-silence.mp3";

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
let deck1playtime = NaN;
let deck2playtime = NaN;

let deck1startTime = 0;
let deck2startTime = 0;

let lastTrackSet = 0;
let mainTrack = 0;

let deck1lastBar = 0;
let deck2lastBar = 0;

// let deck1offset = 0;
// let deck2offset = 0;

export default function TrackPlayer() {
    const [clock, setClock] = useState();

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

    const [deck1offset, setDeck1offset] = useState(0);
    const [deck2offset, setDeck2offset] = useState(0);

    useEffect(() => {
        if (!clock) {
            let newClock = new AudioContext();
            setClock(newClock);
            console.log("current time is:", newClock.currentTime);
        } else {
            console.log("current time is:", clock.currentTime);
        }
    })

    function loadTrackA() {
        console.log("entered");
        let newSong = loadTrack();
        setDeck1prepared(false);
        setDeck1Playing(false);
        if (newSong !== null) {
            setDeck1BPM(Math.round(newSong.songAnalysis.data.track.tempo)) // terribly sus
            if (deck2Song === '') {
                setDeck1playback(1);
            } else {
                if (deck2BPM !== 0) {
                    // console.log("deck1bpm is:",newSong.songAnalysis.data.track.tempo,"and","deck2bpm is:",deck2BPM)
                    let ratio = (deck2BPM / newSong.songAnalysis.data.track.tempo).toPrecision(5);
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
        setDeck2Playing(false);
        if (newSong !== null) {
            setDeck2BPM(Math.round(newSong.songAnalysis.data.track.tempo)) // terribly sus
            if (deck1Song === '') {
                setDeck2playback(1);
            } else {
                if (deck1BPM !== 0) {
                    let ratio = (deck1BPM / Math.round(newSong.songAnalysis.data.track.tempo)).toPrecision(5);
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

    function setDeckOnePlaytime(when) {
        console.log("AHEM 1", when);
        let deckPlaytime = clock.currentTime + when;
        console.log("---- ", deckPlaytime);
        console.log("---- difference is:", clock.currentTime - deckPlaytime);
        // while (clock.currentTime < deckPlaytime) {
        //     console.log("difference is:", clock.currentTime - deckPlaytime);
        //     if (clock.currentTime >= deckPlaytime) {
        //         console.log("omgomgomgomgomg PLAY", clock.currentTime - deckPlaytime);
        //         setDeck1Playing(true);
        //         return;
        //     }
        //     setTimeout(1000);
        // }
        // console.log("lol what 1");
    }

    function setDeckTwoPlaytime(when) {
        console.log("AHEM 1", when);
        let deckPlaytime = clock.currentTime + when;
        console.log("planning for", deckPlaytime);
        deck2playtime = deckPlaytime;
        // setDeck2playtime(deckPlaytime);
        scheduler(2);
        // console.log("---- ", deckPlaytime);
        // console.log("---- difference is:", clock.currentTime - deckPlaytime);
        // while (clock.currentTime < deckPlaytime) {
        //     setTimeout(function () {
        //         if (clock.currentTime >= deckPlaytime) {
        //             console.log("omgomgomgomgomg PLAY", clock.currentTime - deckPlaytime);
        //             setDeck2Playing(true);
        //             return;
        //         }
        //     }, 1000);
        // }
        // console.log("lol what");
    }

    function scheduler(whichDeck) {
        console.log("called the scheduler");
        if (whichDeck === 1) {

        }

        if (whichDeck === 2) {
            console.log("deck 2 has a scheduled time to be played!");
            playDeck2SongScheduled((deck2playtime - clock.currentTime)/2);
        }
    }

    function playDeck2SongScheduled(timeoutValue) {
        console.log("setting timeout for:", timeoutValue);
        setTimeout(function () {
            console.log(clock.currentTime,deck2playtime);
            console.log("checkin time bois", deck2playtime- clock.currentTime);
            if (deck2playtime - clock.currentTime <= 0) {
                deck2startTime = deck2playtime - clock.currentTime;
                setDeck2Playing(true);
            } else {
                console.log(deck2playtime - clock.currentTime);
                if ((deck2playtime - clock.currentTime) <= 0.5) {
                    console.log("case a ");
                    playDeck2SongScheduled(500);
                } else {
                    console.log("case b ");
                    playDeck2SongScheduled((deck2playtime - clock.currentTime)/2);
                }
            }
        }, timeoutValue)
    }

    function playTrackTwo() {
        // if (!deck2Playing && deck2prepared) {
        if (deck2prepared) {
            console.log("time to play track dos");
            setDeck2Playing(true);
            if (lastTrackSet === 0) {
                lastTrackSet = 2;
                mainTrack = 1;
            }
        }
        // setDeck2Playing(true);
        // console.log("zoinks");
        // console.log(deck2Playing);
    }

    function playTrackOne() {
        if (!deck1Playing && deck1prepared) {
            setDeck1Playing(true);
            if (lastTrackSet === 0) {
                lastTrackSet = 1;
                mainTrack = 1;
            }

        }
    }

    function hitBarD1() {                                   //! enable this after
        deck1lastBar = clock.currentTime;
        if (deck2Playing) { 
            console.log("DECK1", deck1lastBar - deck2lastBar);    
        }
    }

    function hitBarD2() {
        deck2lastBar = clock.currentTime;
        if (deck1Playing) {
            console.log("DECK2", deck2offset);    
            setDeck2offset(deck1lastBar-deck2lastBar);
        }
        
    }
    
    return (
        <div className={"djboard"}>
            <div className={"boardpanel"}>
                {deck1BPM !== 0 && <h1>DECK A BPM: {deck1BPM} RATE:{deck1playback}</h1>}
                {tracklist.length !== 0 && <button className={"loadbutton"} onClick={() => loadTrackA()}>Load Track A</button>}
                {deck1Song !== '' && <Deck
                    thisSong={deck1Song.songURL}
                    songName={deck1Song.songName}
                    songArtist={deck1Song.songArtists[0].name}
                    songAnalysis={deck1Song.songAnalysis}
                    playbackRate={deck1playback}
                    prepared={deckOneReady()}
                    play={deck1Playing}
                    // schedule={setDeckTwoPlaytime}
                    startTime={deck1startTime}
                    playOtherTrack={playTrackTwo}
                    hitBar={hitBarD1}
                    offset={deck1offset}
                    deckName={"Deck A"}
                />}
            </div>
            <div className={"boardpanel"}>
                {deck2BPM !== 0 && <h1>DECK B BPM: {deck2BPM} RATE:{deck2playback}</h1>}
                {tracklist.length !== 0 && <button className={"loadbutton"} onClick={() => loadTrackB()}>Load Track B</button>}
                {deck2Song !== '' && <Deck
                    thisSong={deck2Song.songURL}
                    songName={deck2Song.songName}
                    songArtist={deck2Song.songArtists[0].name}
                    songAnalysis={deck2Song.songAnalysis}
                    playbackRate={deck2playback}
                    prepared={deckTwoReady()}
                    play={deck2Playing}
                    // schedule={setDeckOnePlaytime}
                    startTime={deck2startTime}
                    playOtherTrack={playTrackOne}
                    hitBar={hitBarD2}
                    offset={deck2offset}
                    deckName={"Deck B"}
                />}
            </div>
        </div>
    );
}