import React, {useState} from 'react';
let tracklist = [];
let currentSong = 0;
let context = new AudioContext();
const tempTrack = "https://r8---sn-cxaaj5o5q5-tt1y.googlevideo.com/videoplayback?expire=1608414650&ei=WiHeX43CLOSItQf065KQDA&ip=142.126.73.189&id=o-AAJBaJwAGx8B3_GJrES08jyEhH_QGhdYC6GuQQndqhy_&itag=251&source=youtube&requiressl=yes&mh=rs&mm=31%2C26&mn=sn-cxaaj5o5q5-tt1y%2Csn-vgqsknlz&ms=au%2Conr&mv=m&mvi=8&pcm2cms=yes&pl=24&gcr=ca&initcwndbps=1565000&vprv=1&mime=audio%2Fwebm&ns=7p6-huPA8cnX8iRRVq8n3lQF&gir=yes&clen=3788632&dur=222.601&lmt=1595575954110558&mt=1608392686&fvip=1&keepalive=yes&c=WEB&txp=2311222&n=t_Mzw3L5cEmB6FSWU&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cgcr%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgPBl1k_Up0F1hd3TmAo9PtzkcM4YnhEtS1q0E_vjX8NQCIQCaCE1baqVHMIUT6Ur5WAY884hpgrJc43BuHaerr4aJfQ%3D%3D&ratebypass=yes&sig=AOq0QJ8wRQIgaVxYgumdHmI3muG_2y-a8iIZakuBHaKpgjqhXd7pTdQCIQCHYoxiwQRM7oNB9zB1j_MUaungBqDjBnC4yeU9EroMvA%3D%3D";
let currSong = new Audio(tempTrack);
let deck1 = createDeck();
let deck2 = deck1; // TODO CHANGE THIS LATER!!!
function createDeck() {
    return {
        source : context.createMediaElementSource(currSong),
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
    // if (!deck1.playing) {
    deck1.playing = true;
    let startTime = context.currentTime + 0.100;
    deck1 = connectDeck(deck1, buffer1, startTime);
    // deck1.scriptProcessor.onaudioprocess = function(){
    //     let freq;
    //     let formattedFreq = [];
    //     if (deck1.analyser){
    //         freq = new Uint8Array(deck1.analyser.frequencyBinCount);
    //         deck1.analyser.getByteTimeDomainData(freq);
    //         for(let i = 0; i<freq.length; i++){
    //             formattedFreq.push({val:freq[i]});
    //         }
    //     }
    // };
    // calcVolume();
    // calcEffect();
    deck1.source.mediaElement.play();
    // }
}

function play2() {
    if (!deck2.playing) {
        deck1.playing = true;

        let startTime = context.currentTime + 0.100;
        deck2 = connectDeck(deck2, buffer2, startTime);
        deck2.scriptProcessor.onaudioprocess = function(){
            let freq;
            let formattedFreq = [];
            if (deck2.analyser){
                freq = new Uint8Array(deck2.analyser.frequencyBinCount);
                deck2.analyser.getByteTimeDomainData(freq);
                for(let i = 0; i<freq.length; i++){
                    formattedFreq.push({val:freq[i]});
                }
            }
        };
        calcVolume();
        calcEffect();
    }
}

function connectDeck(deck, buffer, startTime) {
    // TODO LEFT OFF here
    // const audioElement = new Audio(tracklist[0].songURL);
    // const track = context.createMediaElementSource(audioElement);
    // deck.source = track;
    // track.connect(context.destination);
    // console.log(deck.source);
    // deck.source.buffer = buffer;
    // deck.source.loop = true;
    if (context.state === 'suspended') {
// check if context is in suspended state (autoplay policy)
        context.resume();
    }
    context.resume();
    // context.
    // audioElement.play();

    // deck.gain.gain.value = 1;
    //
    // deck.lowpass.type = "lowpass";
    // deck.lowpass.frequency.value = 30000;
    // deck.lowpass.Q.value = 5;
    //
    // deck.highpass.type = "highpass";
    // deck.highpass.frequency.value = 0;
    // deck.highpass.Q.value = 5;
    //
    // deck.panner.setPosition(0,0,0);
    //
    // deck.analyser.smoothingTimeConstant = 0.9;
    // deck.analyser.fftSize = 128;
    //
    // deck.source.connect(deck.gain);
    // deck.gain.connect(deck.lowpass);
    // deck.lowpass.connect(deck.highpass);
    // deck.highpass.connect(deck.panner);
    // deck.panner.connect(deck.analyser);
    // deck.panner.connect(context.destination);
    // deck.analyser.connect(deck.scriptProcessor);
    // deck.scriptProcessor.connect(context.destination);

    // deck.pl
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

    let _lowpass1 = 1;
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


const audioCtx = new AudioContext();
let audioElement = new Audio(tempTrack);
audioElement.crossOrigin = "anonymous";
let isPlaying = false;

function playSong() {
    // check if context is in suspended state (autoplay policy)
    // if (audioCtx.state === 'suspended') {
    //     console.log("was suspended, resuming");
    //     audioCtx.resume();
    // }
    // // audioCtx.resume();
    //
    // if (!isPlaying) {
    //     console.log("now =playing...");
    //     audioElement.play().then(e => {
    //         console.log("actully playing");
    //     });
    //     isPlaying = true;
    //     // if track is playing pause it
    // } else if (isPlaying) {
    //     console.log("now pausing...");
    //     audioElement.pause();
    //     isPlaying = false;
    // }
    audioElement.play();

    // ---------

    // play1();
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
const track = audioCtx.createMediaElementSource(audioElement);
console.log(track.context);
const gainNode = audioCtx.createGain();
gainNode.gain.value = 0.2;

track.connect(gainNode).connect(audioCtx.destination);
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
            <audio src={tempTrack}/>
            <button onClick={() => {playTrack()}}>Play Song</button>
            <button onClick={() => {nextTrack()}}>Next Song</button>
            <button onClick={() => {previousTrack()}}>Previous Song</button>
            {trackName !== "" && <h1>Currently playing: {trackName} by {trackArtist}</h1>}
        </div>);
}