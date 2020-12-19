import React, {useState} from 'react';
let tracklist = [];
let currentSong = 0;
let context = new AudioContext();
let deck1 = createDeck();
let deck2 = createDeck();

function createDeck() {
    return {
        source : context.createBufferSource(),
        analyser : context.createAnalyser(),
        panner : context.createPanner(),
        lowpass : context.createBiquadFilter(),
        highpass : context.createBiquadFilter(),
        gain : context.createGain(),
        scriptProcessor : context.createScriptProcessor(2048, 1, 1),
        playing : false
    };
}

function play1() {
    if (!deck1.playing) {
        deck1.playing = true;

        let startTime = context.currentTime + 0.100;
        deck1 = connectDeck(deck1, buffer1, startTime);
        deck1.scriptProcessor.onaudioprocess = function(){
            let freq;
            let formattedFreq = [];
            if (deck1.analyser){
                freq = new Uint8Array(deck1.analyser.frequencyBinCount);
                deck1.analyser.getByteTimeDomainData(freq);
                for(let i = 0; i<freq.length; i++){
                    formattedFreq.push({val:freq[i]});
                }
            }
            // drawEQ('#viz1', formattedFreq);
        };
        calcVolume();
        calcEffect();
    }
}

function play2() {
    if (!deck2.playing) {
        deck1.playing = true;

        let startTime = context.currentTime + 0.100;
        deck2 = connectDeck(deck2, buffer2, startTime);
        deck2.scriptProcessor.onaudioprocess = function(){
            var freq;
            var formattedFreq = [];
            if (deck2.analyser){
                freq = new Uint8Array(deck2.analyser.frequencyBinCount);
                deck2.analyser.getByteTimeDomainData(freq);
                for(var i = 0; i<freq.length; i++){
                    formattedFreq.push({val:freq[i]});
                }
            }
          //  drawEQ('#viz2', formattedFreq);
        };
        calcVolume();
        calcEffect();
    }
}

function connectDeck(deck, buffer, startTime) {
    const song = new Audio(tracklist[0].songURL);
    deck.source = context.createMediaElementSource(song);
    console.log(deck.source);
    // deck.source.buffer = buffer;
    // deck.source.loop = true;

    deck.gain.gain.value = 1;

    deck.lowpass.type = "lowpass";
    deck.lowpass.frequency.value = 30000;
    deck.lowpass.Q.value = 5;

    deck.highpass.type = "highpass";
    deck.highpass.frequency.value = 0;
    deck.highpass.Q.value = 5;

    deck.panner.setPosition(0,0,0);

    deck.analyser.smoothingTimeConstant = 0.9;
    deck.analyser.fftSize = 128;

    deck.source.connect(deck.gain);
    deck.gain.connect(deck.lowpass);
    deck.lowpass.connect(deck.highpass);
    deck.highpass.connect(deck.panner);
    deck.panner.connect(deck.analyser);
    deck.panner.connect(context.destination);
    deck.analyser.connect(deck.scriptProcessor);
    deck.scriptProcessor.connect(context.destination);

    // deck.source.start();
    // deck.source.start(startTime);
    return deck;
}

let buffer1;
let buffer2;


function calcVolume(){
    let fader = 0.5;
    let vol1 = 1;
    let vol2 = 1;
    let vol = 1;
    if(fader > 0){
        vol = vol1 * (1 - fader);
        deck1.gain.gain.value = vol;
        deck2.gain.gain.value = vol2;
    }else if(fader < 0){
        vol = vol2 * (1 + fader);
        deck2.gain.gain.value = vol;
        deck1.gain.gain.value = vol1;
    }else if(fader === 0){
        deck1.gain.gain.value = vol1;
        deck2.gain.gain.value = vol2;
    }
}

function calcEffect(){
    let _speed1 = 1;
    let _speed2 = 1;

    let _lowpass1 = 1;;
    let _lowpass2 = 1;

    let _highpass1 = 1;
    let _highpass2 = 1;

    let _panner1X = 1;
    let _panner1Y = 1;
    let _panner2X = 1;
    let _panner2Y = 1;

    deck1.panner.setPosition(_panner1X,0,-1);
    deck1.panner.setPosition(0, _panner1Y,-1);
    deck2.panner.setPosition(_panner2X,0,-1);
    deck2.panner.setPosition(0, _panner2Y,-1);

    deck1.lowpass.frequency.value = _lowpass1;
    deck2.lowpass.frequency.value = _lowpass2;

    deck1.highpass.frequency.value = _highpass1;
    deck2.highpass.frequency.value = _highpass2;

    // deck1.source.playbackRate.value = 124;
    // deck2.source.playbackRate.value = _speed2;

}

function loadAudioFile(track){
    let item = document.getElementById('input_file_track' + track).files[0];
    let trackNum = track;
    let trackName = item.name;
    // context.decodeAudioData(byteArray, function(buffer) {
    //     switch (trackNum){
    //         case 1:
    //             lcd1.write2Display('lettersRL01', 'Load Completed.');
    //             setTimeout(function(){
    //                 lcd1.write2Display('lettersRL01', trackName);
    //             }, 2200);
    //             buffer1 = buffer;
    //             break;
    //         case 2:
    //             lcd2.write2Display('lettersRL01', 'Load Completed.');
    //             setTimeout(function(){
    //                 lcd2.write2Display('lettersRL01', trackName);
    //             }, 2200);
    //             buffer2 = buffer;
    //             break;
    //     }
    // }, function(err) {
    //     alert('Decode Error');
    // });
    // //For smoothness of drawing the 'Now loading...'.
    // setTimeout(function(){
    //     fr.readAsDataURL(item);
    // }, 1500);
}


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
    play1();
    // if (tracklist.length === 1 && audioElement.paused) {
    //     audioElement.load();
    //     // audioElement = new Audio(tracklist[0].songURL)
    // }
    // if (audioElement.paused) {
    //     console.log("is paused")
    //     audioElement.play();
    // } else {
    //     console.log("is playing")
    //     audioElement.pause();
    // }
}

function loadNextSong() {
    // audioElement.pause();
    // audioElement.load();
    // if (currentSong + 1 < tracklist.length) {
    //     currentSong += 1;
    //     setCurrentSong();
    // }
}

function loadPreviousSong() {
    // audioElement.pause();
    // audioElement.load();
    // if (currentSong - 1 >= 0) {
    //     currentSong -= 1;
    //     setCurrentSong();
    // }
}

function setCurrentSong() {
    // audioElement.pause();
    // audioElement.src = tracklist[currentSong].songURL;
    // console.log(tracklist[currentSong].songURL);
    // audioElement.play();
}

function getCurrentSong() {
    return tracklist[currentSong];
}

export default function TrackPlayer() {
    const [trackName, setTrackName] = useState("");
    const [trackArtist, setTrackArtist] = useState("");


    function playTrack() {
        playSong();
        setSongDetails();
    }

    function nextTrack() {
        loadNextSong();
        setSongDetails();
    }

    function previousTrack() {
        loadPreviousSong();
        setSongDetails();
    }

    function setSongDetails() {
        const currSong = getCurrentSong();
        if (currSong) {
            setTrackName(currSong.songName);
            setTrackArtist(currSong.songArtists[0].name);
        }
    }

    return (
        <div>
            <button onClick={() => {playTrack()}}>Play Song</button>
            <button onClick={() => {nextTrack()}}>Next Song</button>
            <button onClick={() => {previousTrack()}}>Previous Song</button>
            {trackName !== "" && <h1>Currently playing: {trackName} by {trackArtist}</h1>}
        </div>);
}