import React, {Component} from 'react';
import Knob from './frontend_components/Knob';
import WaveSurfer from 'wavesurfer.js';
// import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
// import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import {end} from "iso8601-duration";

const tempTrack = "https://r8---sn-cxaaj5o5q5-tt1y.googlevideo.com/videoplayback?expire=1608683629&ei=DTziX9T7BpmCir4PtcKm6AQ&ip=142.126.73.189&id=o-AMVicLbj0Gv2rQrVjovPek8wxxBV4FI5LMlCg6R1G6tz&itag=251&source=youtube&requiressl=yes&mh=rs&mm=31%2C26&mn=sn-cxaaj5o5q5-tt1y%2Csn-vgqs7nls&ms=au%2Conr&mv=m&mvi=8&pl=24&gcr=ca&initcwndbps=1700000&vprv=1&mime=audio%2Fwebm&ns=s_KJpKjwEsZZ8AheQ_gNizUF&gir=yes&clen=3788632&dur=222.601&lmt=1595575954110558&mt=1608661718&fvip=1&keepalive=yes&c=WEB&txp=2311222&n=P9s4oVIr7EC14Ztz&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cgcr%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRAIgRMh65mjTW6PwQwyNug7n8o3U7_emmK9tyYapXeysfYACIHepjV45GMhesgNEo1wTHgBd5QnjG5icCMtM_PqjfFo_&ratebypass=yes&sig=AOq0QJ8wRgIhANl_rwVxcCYUdSw5WCiK5WWQwGPeV6RqvmXBcFXpCmlMAiEAxuwr91Yd_by6vYdEcszyTD--r58Ll8EWI6QUANVTrYk%3D";
// const tempTrack = "https://www.mfiles.co.uk/mp3-downloads/franz-schubert-standchen-serenade.mp3";

const DROP = 'DROP';
const BEGIN = 'BEGIN';
const COMEDOWN = 'COMEDOWN';
const UNSURE = 'UNSURE';
const REGULAR = 'REG';

export default class Deck extends Component {
    constructor(props) {
        super(props);
        console.log("entered constructor call!");
        this.state = {
            pos: 0,
            playing: false,
            trackName: this.props.songName,
            trackArtist: this.props.songArtist,
            audioCtx: new AudioContext(),
            audioElement: new Audio(this.props.thisSong),
            // audioElement: new Audio(tempTrack),
            audioSettings: {
                gain: 1,
                lowpassF: 11000,
                highpassF: 0,
                high: 1,
                mid: 1,
                low: 1,
                playbackRate: this.props.playbackRate
            }
        };
        this.playPause = this.playPause.bind(this);
        this.changeFilter = this.changeFilter.bind(this);
        this.changeGain = this.changeGain.bind(this);
        this.reconnectAudio = this.reconnectAudio.bind(this);
        this.handlePosChange = this.handlePosChange.bind(this);
     }

    componentDidMount() {
        // wavesurfer begins here
        this.waveform = WaveSurfer.create({
            container: '#waveform',
            waveColor: "#beb9b9",
            // progressColor: "#9a68c9",
            cursorColor: "#dac4f0",
            hideScrollbar: true,
            // responsive: true,
            // partialRender: true,
            normalize: false,
            height:100,
            plugins: [
                // TimelinePlugin.create({
                //     container:"#wave-timeline"
                // }),
                // CursorPlugin.create({
                //     container:"#wave-cursor",
                //     showTime: true,
                // }),
                RegionPlugin.create(),
            ]
        });


        this.waveform.load(this.state.audioElement.src);
        this.waveform.setPlaybackRate(this.props.playbackRate);
        this.reconnectAudio();
    }

    componentDidUpdate(prevProps) {
        if (this.props.thisSong !== prevProps.thisSong) {
            console.log("The song changed!");

            this.state.audioElement.pause();
            this.state.audioElement.load();
            this.state.audioElement = new Audio(this.props.thisSong);

            // this.state.
            this.reconnectAudio();
        }
    }

    reconnectAudio() {
        this.state.audioElement.crossOrigin = "anonymous";

        // LOWPASS
        let lowpass = this.waveform.backend.ac.createBiquadFilter();
        lowpass.frequency.value = this.state.audioSettings.lowpassF;
        lowpass.type = "lowpass";
        lowpass.Q.value = 5;
        this.setState({
            lowpassNode: lowpass
        });

        // HIGHPASS
        let highpass = this.waveform.backend.ac.createBiquadFilter();
        highpass.frequency.value = this.state.audioSettings.highpassF;
        highpass.type = "highpass";
        highpass.Q.value = 5;
        this.setState({
            highpassNode: highpass
        });

        // GAIN
        let gain = this.waveform.backend.ac.createGain();
        gain.value = this.state.audioSettings.gain;
        this.setState({
            gainNode: gain
        });
        this.waveform.backend.setFilter(lowpass, highpass);

        if (this.props.songAnalysis !== 'NOTFOUND') {
            console.log("Got song analysis!");
            console.log(this.props.songAnalysis);
            let sectionArray = this.props.songAnalysis.data.sections;
            let baselineLoudness = this.props.songAnalysis.data.track.loudness;
            let songSections = [];
            let numSections = sectionArray.length;
            let currSection = 0;

            // song analysis variables
            let numDrops = 0;
            let firstDropConfidence = 0;
            let sumDropConfidence = 0;
            let mostConfidentDrop = 0;

            let numComedowns = 0;
            let firstComedownConfidence = 0;
            let sumComedownConfidence = 0;
            let mostConfidentComedown = 0;

            // get an array of when all bars start
            let barStartArray = []
            let allBars = this.props.songAnalysis.data.bars;

            //TODO this is very sus !!!!!!!!!!!
            let bpm = this.props.songAnalysis.data.track.tempo;
            let timeSig = Math.round(this.props.songAnalysis.data.track.time_signature);
            console.log("the time sig is",timeSig);
            let bar = this.props.songAnalysis.data.bars[0].duration;
            let barConfidence = 0;
            allBars.forEach(e => {
                if (e.confidence > barConfidence) {
                    bar = e.duration;
                    barConfidence = e.confidence;
                }
            })

            console.log("The most confident bar is:",bar,"with a confidence of ",barConfidence);

            // let bar = 1.93235;
            let barlength32 = bar*4;
            // let beat = (1/(bpm/60).toPrecision(10)).toPrecision(10);
            // let barLength = (timeSig) * beat;
            console.log("BAR LENGTH IS",bar);

            let songDuration = this.props.songAnalysis.data.track.duration;
            console.log(allBars[0].start)
            let startingPoint = 0;


            let songBeginPoint = allBars[0].start;
            console.log("the song begin point is",songBeginPoint);
            console.log("--------------------------")

            let num32Bar = ((songDuration)/barlength32);
            console.log(num32Bar);

            for (let a = 0; a <= num32Bar; a++) {
                barStartArray.push(((a)*barlength32));
            }
            console.log(barStartArray);
            /**
             * 
             * 
             * IF SECTION HAS NOT BEEN CONFORMED AND 
             * THE DIFFERENCE IS GOOD AND CONFIDENCE IS GOOD
             * THEN TAKE THE SUCCESSFUL AREA
             * 
             */

            sectionArray.forEach(e => {
                currSection ++;

                // let loudnessTag = 0;
                let sectionType = REGULAR;
                let is32length = false;

                let comparisonLoudness = (e.loudness - baselineLoudness)/baselineLoudness;
                console.log("the comparison loudness of section",songSections.length,"is",comparisonLoudness);

                // IF BEGINNING OF SONG
                if (songSections.length === 0) {
                    sectionType = BEGIN;
                }

                // IF LOUD === DROP
                if (comparisonLoudness < 0) {
                    sectionType = DROP;
                }

                // IF LAST SONG WAS DROP AND DIFFERENTIAL OF THIS IS NEGATIVE === COMEDOWN
                let diff = 0;
                if (songSections.length > 0) {
                    diff = songSections[songSections.length - 1].comparisonLoudness - comparisonLoudness;
                    if (songSections[songSections.length - 1].sectionType === DROP) {
                        if (sectionType === DROP) {
                            sectionType = UNSURE;
                        } else {
                            sectionType = COMEDOWN
                        }
                    }
                }

                let analysisSection = {
                    sectionType: sectionType,
                    comparisonLoudness: comparisonLoudness,
                    differential: diff,
                    sectionConfidence: e.confidence
                }

                // For song analysis only
                if (sectionType === DROP) {

                    if (numDrops === 0) {
                        firstDropConfidence = e.confidence;
                    }
                    if (e.confidence > mostConfidentDrop) {
                        mostConfidentDrop = e.confidence;
                    }
                    numDrops ++
                    sumDropConfidence += e.confidence;
                }

                // For song analysis only
                if (sectionType === COMEDOWN) {
                    console.log("comedown")
                    if (numComedowns === 0) {
                        console.log("first comedown")
                        firstComedownConfidence = e.confidence;
                    }
                    if (e.confidence > mostConfidentComedown && currSection !== numSections) {
                        mostConfidentComedown = e.confidence;
                    }
                    numComedowns ++;
                    sumComedownConfidence += e.confidence;
                }



                songSections.push(analysisSection);


                let beginpoint = e.start;
                let endpoint = e.start+e.duration;
                let closestEnd = closest(endpoint, barStartArray);
                let closestBegin = closest(beginpoint, barStartArray);
                let offsetBegin = closestBegin - beginpoint;
                let offsetEnd = closestEnd - endpoint;
                let acceptedConformEnd = false;
                let acceptedConformBegin = false;

                if (Math.abs(offsetEnd) < 2) {
                    acceptedConformEnd = true;
                    endpoint = closestEnd;
                }

                if (Math.abs(offsetBegin) < 2 && sectionType !== BEGIN) {
                    acceptedConformBegin = true;
                    beginpoint = closestBegin;
                }
                let toLoop = false;
                let sizeComparison = ((endpoint - beginpoint)/barlength32).toPrecision(2);
                if (sizeComparison % 1) {
                    is32length = true;
                    // toLoop = true;
                }
                let randomColor = 'rgba(162,254,231,0.3)';

                switch (sectionType) {
                    case "":
                        break;
                    case BEGIN:
                        // toLoop = true;
                        randomColor = 'rgba(50,255,155,0.3)';
                        if (is32length) {
                            randomColor = 'rgba(100,255,55,0.3)';
                        }
                        break;
                    case DROP:
                        randomColor = 'rgba(237,61,155,0.3)';
                        if (is32length) {
                            randomColor = 'rgba(255,31,105,0.3)';
                        }
                        break;
                    case COMEDOWN:
                        randomColor = 'rgba(123,215,255,0.3)'
                        if (is32length) {
                            randomColor = 'rgba(50,150,255,0.3)' //  todo left off here
                        }
                        break;
                    case UNSURE:
                        randomColor = 'rgba(34,1,255,0.2)'
                        if (is32length) {
                            randomColor = 'rgba(0,255,150,0.2)' //  todo left off here
                        }
                }



                let region = {
                    start:beginpoint,
                    end:endpoint,
                    attributes:analysisSection,
                    data:{
                        loudness: e.loudness,
                        tempo: e.tempo,
                        tempo_confidence: e.tempo_confidence,
                        duration: e.duration,
                        begin: e.start,
                        offset_beginning: offsetBegin,
                        offset_ending: offsetEnd,
                        conformBegin: acceptedConformBegin,
                        conformEnd: acceptedConformEnd,
                        difference: sizeComparison,
                        is32length: is32length
                    },
                    color: randomColor,
                    drag: false,
                    resize: false,
                    loop: toLoop
                    }
                this.waveform.addRegion(region);
                }
            );

            // Song Section Analysis
            console.log("-- Completed Analysis of", songSections.length,"sections --");
            let avgDropConfidence = (sumDropConfidence/numDrops).toPrecision(2);
            let avgComedownConfidence = (sumComedownConfidence/numComedowns).toPrecision(2);
            console.log("#DROPS:",numDrops,"1stDrop:",firstDropConfidence,"AvgDrop:",avgDropConfidence,"BestDrop:",mostConfidentDrop);
            console.log("#CD:",numComedowns,"1stCD:",firstComedownConfidence,"AvgCD:",avgComedownConfidence,"BestCD:",mostConfidentComedown);


        } else {
            console.log("song analysis not got, returned:");
            console.log(this.props.songAnalysis);
        }

        this.waveform.on('region-in', e => {
            // $('.waveform__counter').text( formatTime(wavesurfer.getCurrentTime()) );
            // console.log(wavesurfer.current.getCurrentTime());
            console.log("Enterd new region", e.attributes, e.data);
            // console.log(e);
            // onPositionChange(wavesurfer.current.getCurrentTime());

        });
        // this.waveform.backend.setFilter(lowpass, highpass);

    }

    playPause() {
        // check if context is in suspended state (autoplay policy)
        if (this.state.audioCtx.state === 'suspended') {
            //     console.log("was suspended, resuming");
            this.state.audioCtx.resume();

        }
        this.waveform.playPause();
        if (!this.state.playing) {
            // this.state.audioElement.play();
            // this.waveform.playPause();
            this.setState({
                playing: true
            });
        } else {
            // this.state.audioElement.pause();
            this.setState({
                playing: false
            });
        }
    }

    changeFilter(amount) {
        console.log(amount)
        if (amount <= 14000) {
            console.log("A");
            this.state.audioSettings.lowpassF = amount;
            this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
        } else if (amount >= 20000) {
            console.log("B");
            let highpassAmount = amount - 20000;
            this.state.audioSettings.highpassF = highpassAmount;
            this.state.highpassNode.frequency.value = this.state.audioSettings.highpassF;
        } else {
            console.log("C");
            this.state.audioSettings.lowpassF = 30000;
            this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
            this.state.audioSettings.highpassF = 0;
            this.state.highpassNode.frequency.value = this.state.audioSettings.highpassF;
        }
    }

    changeGain(amount) {
        console.log("this ran")
        this.setState({
            audioSettings: {
                gain: (amount/100).toPrecision(2)
            }
        })
        this.waveform.setVolume(this.state.audioSettings.gain || 1);
    }

    handlePosChange(e) {
        this.setState({
            pos: e
        });
    }

    render() {
        return (
            <>
                <div className={"deck"}>
                    {this.state.trackName !== "" && <h3>{this.state.trackName} by {this.state.trackArtist}</h3>}
                    <Knob size={70} numTicks={70} degrees={260} min={0} max={100} value={50} color={true} onChange={this.changeGain}/>
                    <label>GAIN</label>
                    <Knob size={70} numTicks={70} degrees={260} min={1000} max={30000} value={15000} color={true} onChange={this.changeFilter}/>
                    <label>FILTER</label>
                    <button className={"playButton"} onClick={() => {this.playPause()}}>{this.state.playing ? "Pause" : "Play"}</button>
                    {/*<Waveform url={this.state.audioElement} onPositionChange={this.handlePosChange} isPlaying={this.state.playing} audioCtx={this.state.audioCtx} lowpassNum={this.state.lowpassF}/>*/}
                    <div id="waveform"/>
                    <div id="wave-timeline"/>
                </div>

            </>
        );
    }
}


function closest(needle, haystack) {
    let closeGrain = 100000000000000;
    let grainCloseness = 100000000000000;
    haystack.forEach(grain => {
        let thisCloseness = Math.abs(needle - grain)
        if (Math.abs(needle - grain) < grainCloseness) {
            grainCloseness = thisCloseness;
            closeGrain = grain;
        }
    })
    return closeGrain;

    // return haystack.reduce((a, b) => {
    //     let aDiff = Math.abs(a - needle);
    //     let bDiff = Math.abs(b - needle);
    //
    //     if (aDiff == bDiff) {
    //         return a > b ? a : b;
    //     } else {
    //         return bDiff < aDiff ? b : a;
    //     }
    // });
}
// changeLows(amount) { // TODO
//     console.log("lows is", amount)
//     this.state.audioSettings.lowpassF = amount;
//     this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
// }

// changeMids(amount) { // TODO
//     console.log("mids is", amount)
//     this.state.audioSettings.lowpassF = amount;
//     this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
// }

// changeHighs(amount) { // TODO
//     console.log("highs is", amount)
//     this.state.audioSettings.lowpassF = amount;
//     this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
// }
