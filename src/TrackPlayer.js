import React, {useState} from 'react';
import Deck from "./Deck";
let tracklist = [];

// let deck1 = createDeck();
// let deck2 = deck1; // TODO CHANGE THIS LATER!!!
// function createDeck() {
//     return {
//         source : context.createMediaElementSource(currSong),
//         analyser : context.createAnalyser(),
//         panner : context.createPanner(),
//         lowpass : context.createBiquadFilter(),
//         highpass : context.createBiquadFilter(),
//         gain : context.createGain(),
//         scriptProcessor : context.createScriptProcessor(2048, 1, 1),
//         playing : false
//     };
// }
// function connectDeck(deck, buffer, startTime) {
//     // TODO LEFT OFF here
//     // const audioElement = new Audio(tracklist[0].songURL);
//     // const track = context.createMediaElementSource(audioElement);
//     // deck.source = track;
//     // track.connect(context.destination);
//     // console.log(deck.source);
//     // deck.source.buffer = buffer;
//     // deck.source.loop = true;
//     if (context.state === 'suspended') {
// // check if context is in suspended state (autoplay policy)
//         context.resume();
//     }
//     context.resume();
//     // context.
//     // audioElement.play();
//
//     // deck.gain.gain.value = 1;
//     //
//     // deck.lowpass.type = "lowpass";
//     // deck.lowpass.frequency.value = 30000;
//     // deck.lowpass.Q.value = 5;
//     //
//     // deck.highpass.type = "highpass";
//     // deck.highpass.frequency.value = 0;
//     // deck.highpass.Q.value = 5;
//     //
//     // deck.panner.setPosition(0,0,0);
//     //
//     // deck.analyser.smoothingTimeConstant = 0.9;
//     // deck.analyser.fftSize = 128;
//     //
//     // deck.source.connect(deck.gain);
//     // deck.gain.connect(deck.lowpass);
//     // deck.lowpass.connect(deck.highpass);
//     // deck.highpass.connect(deck.panner);
//     // deck.panner.connect(deck.analyser);
//     // deck.panner.connect(context.destination);
//     // deck.analyser.connect(deck.scriptProcessor);
//     // deck.scriptProcessor.connect(context.destination);
//
//     // deck.pl
//     // deck.source.start(startTime);
//     return deck;
// }
// //
// // let buffer1;
// // let buffer2;
// //
// //
// // function calcVolume(){
// //     let fader = 0.5;
// //     let vol1 = 1;
// //     let vol2 = 1;
// //     let vol = 1;
// //     if(fader > 0){
// //         vol = vol1 * (1 - fader);
// //         deck1.gain.gain.value = vol;
// //         deck2.gain.gain.value = vol2;
// //     }else if(fader < 0){
// //         vol = vol2 * (1 + fader);
// //         deck2.gain.gain.value = vol;
// //         deck1.gain.gain.value = vol1;
// //     }else if(fader === 0){
// //         deck1.gain.gain.value = vol1;
// //         deck2.gain.gain.value = vol2;
// //     }
// // }
//
// function calcEffect(){
//     let _speed1 = 1;
//     let _speed2 = 1;
//
//     let _lowpass1 = 1;
//     let _lowpass2 = 1;
//
//     let _highpass1 = 1;
//     let _highpass2 = 1;
//
//     let _panner1X = 1;
//     let _panner1Y = 1;
//     let _panner2X = 1;
//     let _panner2Y = 1;
//
//     deck1.panner.setPosition(_panner1X,0,-1);
//     deck1.panner.setPosition(0, _panner1Y,-1);
//     deck2.panner.setPosition(_panner2X,0,-1);
//     deck2.panner.setPosition(0, _panner2Y,-1);
//
//     deck1.lowpass.frequency.value = _lowpass1;
//     deck2.lowpass.frequency.value = _lowpass2;
//
//     deck1.highpass.frequency.value = _highpass1;
//     deck2.highpass.frequency.value = _highpass2;
//
//     // deck1.source.playbackRate.value = 124;
//     // deck2.source.playbackRate.value = _speed2;
//
// }


// --- Global Functions ---
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


// function loadNextSong() {
//     audioElement.pause();
//     audioElement.load();
//     if (currentSong + 1 < tracklist.length) {
//         currentSong += 1;
//         setCurrentSong();
//     }
// }

// function loadPreviousSong() {
//     audioElement.pause();
//     audioElement.load();
//     if (currentSong - 1 >= 0) {
//         currentSong -= 1;
//         setCurrentSong();
//     }
// }

// function setCurrentSong() {
//     audioElement.pause();
//     audioElement.src = tracklist[currentSong].songURL;
//     console.log(tracklist[currentSong].songURL);
//     audioElement.play();
// }

export default function TrackPlayer() {
    return (
        <>
            <hr/>
            <div className={"djboard"}>
                <Deck/>
                <Deck/>
                {/*<button onClick={() => {nextTrack()}}>Next Song</button>*/}
                {/*<button onClick={() => {previousTrack()}}>Previous Song</button>*/}
            </div>
        </>);
}