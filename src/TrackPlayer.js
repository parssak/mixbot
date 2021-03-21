import React, { useEffect, useState } from 'react';
import Deck from "./Deck";
import './css_files/Queue.scss';
import { loadTrack, nextSongInQueue } from "./Mixbot";

let deck1startTime = 0;
let deck2startTime = 0;

let lastTrackSet = 0;
let mainTrack = 0;

let deck1lastBar = 0;
let deck2lastBar = 0;

let deckOneGlow = 9;
let deckTwoGlow = 9;

let equalizedGainVal = -10;

export default function TrackPlayer({ newThought, masterPlay }) {
    const [clock, setClock] = useState();

    const [deck1Song, setDeck1Song] = useState('');
    const [deck2Song, setDeck2Song] = useState('');

    const [deck1BPM, setDeck1BPM] = useState(0);
    const [deck2BPM, setDeck2BPM] = useState(0);

    const [deck1playback, setDeck1playback] = useState(1);
    const [deck2playback, setDeck2playback] = useState(1);

    const [deck1prepared, setDeck1prepared] = useState(false);
    const [deck2prepared, setDeck2prepared] = useState(false);

    const [deck1remove, setDeck1remove] = useState(false);
    const [deck2remove, setDeck2remove] = useState(false);

    const [deck1Playing, setDeck1Playing] = useState(false);
    const [deck2Playing, setDeck2Playing] = useState(false);

    const [deck1offset, setDeck1offset] = useState(0);
    const [deck2offset, setDeck2offset] = useState(0);

    // const [deck1gain, setDeck1Gain] = useState(null); // actual volumes in db
    // const [deck2gain, setDeck2Gain] = useState(null);

    const [deck1vol, setdeck1vol] = useState(1); // relative vol 0 -1
    const [deck2vol, setdeck2vol] = useState(1);

    useEffect(() => {
        if (!clock) {
            let newClock = new AudioContext();
            setClock(newClock);
        } 
        
        if (Math.random() > 0.5) {
            deckOneGlow += 10;
            if (deckOneGlow >= 360) deckOneGlow = 0;
        } else {
            deckTwoGlow += 10;
            if (deckTwoGlow >= 360) deckTwoGlow = 0;
        }
    })

    useEffect(() => {
        function LoadTrack() {
            if (nextSongInQueue() !== null) {
                console.log("next song in queue was not null");
                if ((deck1BPM == 0) && (deck1Song == '')) {
                    loadTrackA();
                } else if ((deck2BPM == 0) && (deck2Song == '')) {
                    loadTrackB();
                }
            } else {
                console.log("got next song in queue to be null");
            }
        }
        LoadTrack();
    })

    function loadTrackA() {
        let newSong = loadTrack();
        setDeck1prepared(false);
        setDeck1Playing(false);
        setDeck1remove(false);
        if (newSong !== null) {
            if (!newSong.songAnalysis.analysis) {
                console.log("CASE A", newSong);
            } else {
                console.log("CASE B", newSong);
            }
            setDeck1BPM(Math.round(newSong.songAnalysis.analysis.tempo)) // terribly sus
            let newvol = (newSong.songAnalysis.analysis.loudness / equalizedGainVal).toPrecision(5);
            console.log("DECK A NEW VOLUME >>>>>>>>>>>>>>>>", newvol);
            setdeck1vol(newvol);
            if (deck2Song === '') {
                setDeck1playback(1);
            } else {
                if (deck2BPM !== 0) {
                    let ratioPB = (deck2BPM / newSong.songAnalysis.analysis.tempo).toPrecision(5);
                    setDeck1playback(ratioPB);
                } else {
                    setDeck1playback(1);
                }
            }
            let think = "Put " + newSong.songName + " on Deck A";
            newThought(think);
            setDeck1Song(newSong);
        }
    }

    function loadTrackB() {
        let newSong = loadTrack();
        setDeck2prepared(false);
        setDeck2Playing(false);
        setDeck2remove(false);
        if (newSong !== null) {
            

            // EITHER IS newSong.songAnalysis || newSOng.songAnalysis.analysis
            if (!newSong.songAnalysis.analysis) {
                console.log("CASE A", newSong);
            } else {
                console.log("CASE B", newSong);
            }

            setDeck2BPM(Math.round(newSong.songAnalysis.analysis.tempo)) // terribly sus
            let newvol = (newSong.songAnalysis.analysis.loudness / equalizedGainVal).toPrecision(5);
            // console.log("DECK B NEW VOLUME >>>>>>>>>>>>>>>>", newvol);
            setdeck2vol(newvol);

            if (deck1Song === '') {
                setDeck2playback(1);
            } else {
                if (deck1BPM !== 0) {
                    let ratio = (deck1BPM / Math.round(newSong.songAnalysis.analysis.tempo)).toPrecision(5);
                    setDeck2playback(ratio);
                } else {
                    setDeck2playback(1);
                }
            }
            let think = "Put " + newSong.songName + " on Deck B";
            newThought(think);
            setDeck2Song(newSong)
        } else {
            console.log("[WARNING] new song was null");
        }
    }

    function deckOneReady() {
        if (!deck1prepared) {
            setDeck1prepared(true);
            if (!deck2Playing) {
                setDeck1Playing(true);
            }
        }
    }

    function deckTwoReady() {
        if (!deck2prepared) {
            setDeck2prepared(true);
            if (!deck1Playing) {
                setDeck2Playing(true);
            }
        }
    }

    function playTrackTwo() {
        if (deck2prepared) {
            setDeck2Playing(true);
            setDeck2prepared(false);
            if (lastTrackSet === 0) {
                lastTrackSet = 2;
                mainTrack = 1;
            }
        }
    }

    function playTrackOne() {
        if (deck1prepared) {
            setDeck1Playing(true);
            setDeck1prepared(false);
            if (lastTrackSet === 0) {
                lastTrackSet = 1;
                mainTrack = 1;
            }

        }
    }

    function hitBarD1() {
        deck1lastBar = clock.currentTime;
        if (deck2Playing) {
            setDeck1offset(deck2lastBar - deck1lastBar);
        }
    }

    function hitBarD2() {
        deck2lastBar = clock.currentTime;
        if (deck1Playing) {
            setDeck2offset(deck1lastBar - deck2lastBar);
        }
    }

    function changeTrackA() {
        mainTrack = 2;
        setDeck2playback(1);
        loadTrackA();
    }

    function changeTrackB() {
        mainTrack = 1;
        setDeck1playback(1);
        loadTrackB();
    }

    function takeOutA() {
        if (deck1Playing) setDeck1remove(true);
        
    }

    function takeOutB() {
        if (deck2Playing) setDeck2remove(true);
    }

    return (
        <>
            <div className={"djboard"}>
                <div className={"boardpanel"} style={deck1Playing ? { boxShadow: `0 3px 100px hsla(${deckOneGlow}, 100%, 64%, 0.302)` } : { boxShadow: `0 0 0 hsla(${deckOneGlow}, 100%, 64%, 0.302)` }}>
                    <h3>DECK A</h3>
                    {deck1Song !== '' && <Deck
                        
                        thisSong={deck1Song.songURL}
                        songName={deck1Song.songName}
                        songArtist={deck1Song.songArtists[0].name}
                        songImage={deck1Song.trackImage}
                        songAnalysis={deck1Song.songAnalysis}
                        
                        playbackRate={deck1playback}
                        prepared={deckOneReady}
                        play={deck1Playing}
                        startTime={deck1startTime}
                        playOtherTrack={playTrackTwo}
                        hitBar={hitBarD1}
                        
                        offset={deck1offset}
                        deckName={"Deck A"}
                        finished={changeTrackA}
                        recommendedVolume={1}
                        shouldSync={mainTrack !== 1}
                        otherReady={deckTwoReady}
                        waveformID={"waveformA"}
                        bpm={deck1BPM}
                        newThought={newThought}
                        shouldRemove={deck1remove}
                        removeOther={takeOutB}
                        otherPlaying={deck2Playing}

                        masterPlay={masterPlay}
                    />
                    }

                </div>
                <div className={"boardpanel"} style={deck2Playing ? { boxShadow: `0 3px 100px hsla(${deckTwoGlow}, 100%, 64%, 0.302)` } : { boxShadow: `0 0 0 hsla(${deckTwoGlow}, 100%, 64%, 0.302)` }}>
                    <h3 style={{ textAlign: 'right' }}>DECK B</h3>
                    {deck2Song !== '' && <Deck
                        thisSong={deck2Song.songURL}
                        songName={deck2Song.songName}
                        songArtist={deck2Song.songArtists[0].name}
                        songImage={deck2Song.trackImage}
                        songAnalysis={deck2Song.songAnalysis}
                        
                        playbackRate={deck2playback}
                        prepared={deckTwoReady}
                        play={deck2Playing}
                        startTime={deck2startTime}
                        playOtherTrack={playTrackOne}
                        hitBar={hitBarD2}
                        offset={deck2offset}
                        deckName={"Deck B"}
                        finished={changeTrackB}
                        recommendedVolume={1}
                        shouldSync={mainTrack !== 2}
                        otherReady={deckOneReady}
                        waveformID={"waveformB"}
                        bpm={deck2BPM}
                        newThought={newThought}
                        shouldRemove={deck2remove}
                        removeOther={takeOutA}
                        otherPlaying={deck1Playing}

                        masterPlay={masterPlay}
                    />}
                </div>
            </div>
        </>
    );
}