import React, { Component } from 'react';
import Knob from './frontend_components/Knob';
import WaveSurfer from 'wavesurfer.js';
import { Joystick } from 'react-joystick-component';
import { Draggable } from 'react-draggable';
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import { end } from "iso8601-duration";

const tempTrack = "https://r8---sn-cxaaj5o5q5-tt1y.googlevideo.com/videoplayback?expire=1608683629&ei=DTziX9T7BpmCir4PtcKm6AQ&ip=142.126.73.189&id=o-AMVicLbj0Gv2rQrVjovPek8wxxBV4FI5LMlCg6R1G6tz&itag=251&source=youtube&requiressl=yes&mh=rs&mm=31%2C26&mn=sn-cxaaj5o5q5-tt1y%2Csn-vgqs7nls&ms=au%2Conr&mv=m&mvi=8&pl=24&gcr=ca&initcwndbps=1700000&vprv=1&mime=audio%2Fwebm&ns=s_KJpKjwEsZZ8AheQ_gNizUF&gir=yes&clen=3788632&dur=222.601&lmt=1595575954110558&mt=1608661718&fvip=1&keepalive=yes&c=WEB&txp=2311222&n=P9s4oVIr7EC14Ztz&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cgcr%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRAIgRMh65mjTW6PwQwyNug7n8o3U7_emmK9tyYapXeysfYACIHepjV45GMhesgNEo1wTHgBd5QnjG5icCMtM_PqjfFo_&ratebypass=yes&sig=AOq0QJ8wRgIhANl_rwVxcCYUdSw5WCiK5WWQwGPeV6RqvmXBcFXpCmlMAiEAxuwr91Yd_by6vYdEcszyTD--r58Ll8EWI6QUANVTrYk%3D";
// const tempTrack = "https://www.mfiles.co.uk/mp3-downloads/franz-schubert-standchen-serenade.mp3";


const DROP = 'DROP';
const BEGIN = 'BEGIN';
const COMEDOWN = 'COMEDOWN';
const UNSURE = 'UNSURE';
const REGULAR = 'REG';

/**
 * TODO
 * - Set up queueing of tracks
 */

let barSize = 0;

export default class Deck extends Component {
    constructor(props) {
        super(props);
        console.log("entered constructor call!");
        this.state = {
            pos: 0,
            locked: false,
            scheduledDemise: false,
            currSec: "NOT PLAYING",
            playing: false,
            trackName: this.props.songName,
            trackArtist: this.props.songArtist,
            audioCtx: new AudioContext(),
            audioElement: new Audio(this.props.thisSong),
            audioSettings: {
                gain: 1,
                lowpassF: 11000,
                highpassF: 0,
                high: 1,
                mid: 1,
                low: 1,
                playbackRate: this.props.playbackRate
            },
            currSectionAnalysis: {
                begin: NaN,
                endpoint: NaN,
                comparisonLoudness: NaN,
                differential: NaN,
                sectionConfidence: NaN,
                conformedBegin: NaN,
                conformedEnd: NaN,
                oBegin: NaN,
                oEnd: NaN,
                sectionColor: `rgb(255,255,255)`,
                goodForMix: false,
                isBest: false
            },
            startingPos: 0
        };
        this.lastAdjustTime = 0;
        this.synced = false;
        this.fadingOut = false;
        this.fadingIn = false;
        this.totalOffset = 0;
        this.numSuccessful = 0;
        this.numDropsPassed = 0;


        this.playPause = this.playPause.bind(this);
        this.fadeOutSong = this.fadeOutSong.bind(this);
        this.changeFilter = this.changeFilter.bind(this);
        this.changeGain = this.changeGain.bind(this);
        this.reconnectAudio = this.reconnectAudio.bind(this);
        this.analyzeData = this.analyzeData.bind(this);
        this.handlePosChange = this.handlePosChange.bind(this);
    }

    componentDidMount() {
        console.log("|| ---- COMPONENT DID MOUNT ---- ||", this.props.deckName);
        // wavesurfer begins here
        this.waveform = WaveSurfer.create({
            container: '#waveform',
            waveColor: "#beb9b9",
            cursorColor: "#dac4f0",
            hideScrollbar: true,
            normalize: false,
            height: 100,
            plugins: [
                RegionPlugin.create(),
            ]
        });


        this.waveform.load(this.state.audioElement.src);
        this.waveform.setPlaybackRate(this.props.playbackRate);
        this.reconnectAudio();
    }

    componentDidUpdate(prevProps) {
        console.log("||| ---- COMPONENT DID UPDATE ---- |||", this.props.deckName);

        if (this.props.thisSong !== prevProps.thisSong) { // TODO LEFT OFF HERE, YOU WERE TRYING TO MAKE SWITCHING SONGS ON A SINGLE DECK WORK BC IT KEEPS PLAYING THE OLD ONE ALSO REGIONS AREN"T DISAPPEARING
            console.log("|| -- THE SONG CHANGED -- ||", this.props.deckName);
            this.waveform.pause();

            this.synced = false;
            this.numSuccessful = 0;
            this.totalOffset = 0;
            this.fadingOut = false;
            this.fadingIn = false;
            this.numDropsPassed = 0;

            this.waveform.destroy();
            this.waveform = WaveSurfer.create({
                container: '#waveform',
                waveColor: "#beb9b9",
                cursorColor: "#dac4f0",
                hideScrollbar: true,
                normalize: false,
                height: 100,
                plugins: [
                    RegionPlugin.create(),
                ]
            });

            this.state.audioElement.load();
            this.state.audioElement = new Audio(this.props.thisSong);
            // this.state.audioElement.src = this.props.thisSong;

            this.waveform.load(this.state.audioElement.src);
            this.waveform.setPlaybackRate(this.props.playbackRate);

            this.reconnectAudio();
        }

        if (this.state.audioCtx.state !== 'suspended') {
            if (this.props.play !== this.waveform.isPlaying()) {
                if (!this.props.play) {
                    console.log("~~~ SHOULD BE PAUSED NGL ~~~");
                    // this.waveform.stop();
                    this.waveform.pause(); // todo testing this swap
                } else {
                    this.playPause();
                }
            }
        }
        if (!this.props.shouldSync) this.synced = true;

        if (Math.abs(this.props.offset) < 0.1 && this.waveform.isPlaying()) {
            this.numSuccessful++;
            if (Math.abs(this.props.offset) < 0.05) this.numSuccessful++;
            // if (Math.abs(this.props.offset) < 0.01) this.numSuccessful++;
            if (this.numSuccessful >= 3) {
                this.synced = true;
            }

            // if (this.numSuccessful < 5) {
            //     console.log(this.props.deckName, "-------------------num succesfull:", this.numSuccessful, this.props.offset, Math.abs(this.props.offset), Math.abs(this.props.offset) < 0.1);
            //     if (this.synced) {
            //         console.log(this.props.deckName, "-------------------SYNCEDDDDD");
            //     }
            // }
        }

        if (this.props.offset !== prevProps.offset &&
            this.waveform.getCurrentTime() - this.lastAdjustTime > 5 &&
            Math.abs(this.props.offset) >= 0.05 &&
            !this.synced) {
            this.numSuccessful = 0;
            console.log(this.props.deckName, "-> about to sync");
            if (this.waveform.getCurrentTime() + this.props.offset > 1 && this.props.offset != 0) {
                this.lastAdjustTime = this.waveform.getCurrentTime();
                let adjustedOffset = this.props.offset;
                this.totalOffset = this.props.offset;
                console.log("%%%   ", this.props.deckName, "total offset:", this.totalOffset, "which is", this.totalOffset / barSize, "bars");
                let desiredTime = this.waveform.getCurrentTime() + this.props.offset;
                console.log("%%%   ", this.props.deckName, " song pos was at:", this.waveform.getCurrentTime(), "we need:", desiredTime);
                this.waveform.pause();
                this.waveform.skip(adjustedOffset);
                this.waveform.playPause();
                console.log("%%%   ", this.props.deckName, " now we are at:", this.waveform.getCurrentTime(), "difference is:", desiredTime - this.waveform.getCurrentTime(), "offset diff:", (this.props.offset - desiredTime - this.waveform.getCurrentTime()));
            } else {
                console.log(this.props.deckName, "-> didn't sync ");
            }
        }
    }

    analyzeData() {
        let sectionArray = this.props.songAnalysis.data.sections;
        let baselineLoudness = this.props.songAnalysis.data.track.loudness;
        let allBars = this.props.songAnalysis.data.bars;
        let bpm = this.props.songAnalysis.data.track.tempo;
        let timeSig = Math.round(this.props.songAnalysis.data.track.time_signature);

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
    
        let bar = this.props.songAnalysis.data.bars[0].duration;
        let barConfidence = 0;
        allBars.forEach(e => {
            if (e.confidence > barConfidence) {
                bar = e.duration;
                barConfidence = e.confidence;
            }
        })
        barSize = bar;
        let barlength32 = bar * 2;
        let actuallength32 = bar * 4;
        let songDuration = this.props.songAnalysis.data.track.duration;
        let startingPoint = 0;
        let songBeginPoint = allBars[0].start;

        let num32Bar = ((songDuration) / barlength32);

        for (let a = 0; a <= num32Bar; a++) {
            barStartArray.push(((a) * barlength32));
        }

        let calibrationArray = [];

        let numCalibrationChunks = (songDuration) / bar;

        for (let c = 0; c <= numCalibrationChunks; c++) {
            calibrationArray.push(((c) * bar));
        }


        for (let b = 0; b < calibrationArray.length - 1; b++) {
            let barColor = (b % 2 ? "rgba(255, 60, 54,0.05)" : "rgba(46, 255, 154,0.05)");
            let barRegion = {
                start: calibrationArray[b],
                end: calibrationArray[b + 1],
                color: barColor,
                drag: false,
                resize: false,
                computed: {}
            };
            this.waveform.addRegion(barRegion);
        }

        sectionArray.forEach(e => {
            currSection++;
            let sectionType = REGULAR;
            let is32length = false;

            let comparisonLoudness = (e.loudness - baselineLoudness) / baselineLoudness;
           
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
                diff = songSections[songSections.length - 1].computed.comparisonLoudness - comparisonLoudness;
                if (songSections[songSections.length - 1].sectionType === DROP) {
                    if (sectionType === DROP) {
                        sectionType = UNSURE;
                    } else {
                        sectionType = COMEDOWN
                    }
                }
            }
            // For song analysis only
            if (sectionType === DROP) {

                if (numDrops === 0) {
                    firstDropConfidence = e.confidence;
                }
                if (e.confidence > mostConfidentDrop) {
                    mostConfidentDrop = e.confidence;
                }
                numDrops++
                sumDropConfidence += e.confidence;
            }
            if (sectionType === COMEDOWN) {
                // console.log("comedown")
                if (numComedowns === 0) { // Sets this as the first comedown 
                    firstComedownConfidence = e.confidence;
                }
                if (e.confidence > mostConfidentComedown && currSection !== numSections) {
                    mostConfidentComedown = e.confidence; // Sets this as the most confident comedown
                }

                numComedowns++;
                sumComedownConfidence += e.confidence;
            }

            let beginpoint = e.start;
            let endpoint = e.start + e.duration;
            let closestEnd = closest(endpoint, barStartArray);
            let closestBegin = closest(beginpoint, barStartArray);
            let offsetBegin = closestBegin - beginpoint;
            let offsetEnd = closestEnd - endpoint;
            let acceptedConformEnd = false;
            let acceptedConformBegin = false;

            beginpoint = closestBegin;
            endpoint = closestEnd;


            let sizeComparison = ((endpoint - beginpoint) / barlength32).toPrecision(2); // checks if section is of calculated 32bar length
            if (sizeComparison % 1) {
                is32length = true;
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
                        randomColor = 'rgba(50,150,255,0.3)'
                    }
                    break;
                case UNSURE:
                    randomColor = 'rgba(34,1,255,0.2)'
                    if (is32length) {
                        randomColor = 'rgba(0,255,150,0.2)'
                    }
                    break;
                default:
                    break;
            }

            let goodForMix = false;
            if (sectionType !== DROP) {
                if (comparisonLoudness > 0 && comparisonLoudness < 0.1) {
                    randomColor = 'rgba(218, 165, 32,0.3)';
                    goodForMix = true;
                } else if (sectionType === BEGIN) {
                    randomColor = 'rgba(218, 165, 32,0.3)';
                    goodForMix = true;
                }
            }
            let analysisSection = {
                sectionType: sectionType,
                begin: beginpoint,
                endpoint: endpoint,
                computed: {
                    comparisonLoudness: comparisonLoudness,
                    differential: diff,
                    sectionConfidence: e.confidence, // todo left off here! i was completing up the separation from analysis to reconnect 
                    conformedBegin: acceptedConformBegin,
                    conformedEnd: acceptedConformEnd,
                    oBegin: offsetBegin,
                    oEnd: offsetEnd
                },
                sizeComparison: sizeComparison,
                is32: is32length,
                sectionColor: randomColor,
                goodForMix: goodForMix
            }
            songSections.push(analysisSection);
        })

        if (songSections.length > 2) {
            console.log("sec1:", songSections[0].sizeComparison, "sec2:", songSections[1].sizeComparison);
            console.log("sec1:", songSections[0].is32, "sec2:", songSections[1].is32);
            if ((songSections[0].sizeComparison == 4) || (songSections[0].sizeComparison == 2 && songSections[1].sizeComparison == 2)) {
                console.log("CASE A START POS");
                this.setState({
                    startingPos: 0
                })
            } else if (songSections[0].sizeComparison == 2.0) { // todo make this if songSections[1].sizeComparison is a multiple of 4
                console.log("CASE B START POS");
                console.log("mult of 4?", songSections[1].sizeComparison % 4);
                this.setState({
                    startingPos: songSections[0].endpoint
                })
            } else {
                console.log("CASE C START POS");
            }
        }

        return songSections;
    }

    reconnectAudio() {
        this.state.audioElement.crossOrigin = "anonymous";

        // LOWPASS
        let lowpass = this.waveform.backend.ac.createBiquadFilter();
        lowpass.frequency.value = this.state.audioSettings.lowpassF || 11000;
        lowpass.type = "lowpass";
        lowpass.Q.value = 5;
        this.setState({
            lowpassNode: lowpass
        });

        // HIGHPASS
        let highpass = this.waveform.backend.ac.createBiquadFilter();
        highpass.frequency.value = this.state.audioSettings.highpassF || 0;
        highpass.type = "highpass";
        highpass.Q.value = 5;
        this.setState({
            highpassNode: highpass
        });

        // GAIN
        let gain = this.waveform.backend.ac.createGain();
        gain.value = this.state.audioSettings.gain || 0.01;
        this.setState({
            gainNode: gain
        });
        this.waveform.backend.setFilter(lowpass, highpass);

        if (this.props.songAnalysis !== 'NOTFOUND') {

            let analyzed = this.analyzeData();

            //! Getting the best of each region
            let bestReg;
            let bestDrop;
            let bestComedown;
            let bestOverall;

            let bestRegNum = 0;
            let bestDropNum = 0;
            let bestComedownNum = 0;
            let bestOverallNum = 0;

            let bestRegColor = "rgb(158, 31, 255)" // royal purple
            let bestDropColor = "rgb(242, 123, 31)"; // orange
            let bestComedownColor = "rgb(185, 245, 66)"; // lime
            let bestOverallColor = "rgb(66, 245, 191)"; // teal
            let cs = 0; // currsection
            analyzed.forEach(e => {
                // console.log(e);
                if (e.sectionConfidence > bestOverallNum) {
                    bestOverallNum = e.sectionConfidence;
                    bestOverall = cs;
                }

                switch (e.sectionType) {
                    case DROP:
                        if (e.sectionConfidence > bestDropNum) {
                            bestDropNum = e.sectionConfidence;
                            bestDrop = cs;
                        }
                        break;
                    case REGULAR:
                        if (e.sectionConfidence > bestRegNum) {
                            bestRegNum = e.sectionConfidence;
                            bestReg = cs;
                        }
                        break;
                    case COMEDOWN:
                        if (e.sectionConfidence > bestComedownNum) {
                            bestComedownNum = e.sectionConfidence;
                            bestComedown = cs;
                        }
                        break;
                    default:
                        break;
                }
                cs++;
            })
            let cs1 = 0;
            analyzed.forEach(section => {
                let thisSectionColor = section.sectionColor;
                let isBest = false;
                switch (section.sectionType) {
                    case DROP:
                        section.endpoint -= 0.1;
                        if (cs1 === bestDrop) {
                            thisSectionColor = bestDropColor;
                            isBest = true;
                        }
                        break;
                    case REGULAR:
                        if (cs1 === bestReg) {
                            thisSectionColor = bestRegColor;
                            isBest = true;
                        }
                        break;
                    case COMEDOWN:
                        if (cs1 === bestComedown) {
                            thisSectionColor = bestComedownColor;
                            isBest = true;
                        }
                        break;
                    default:
                        break;
                }

                if (cs1 === bestOverall) {
                    thisSectionColor = bestOverallColor;
                }

                let region = {
                    start: section.begin,
                    end: section.endpoint,
                    attributes: section.computed,
                    data: section,
                    color: thisSectionColor,
                    drag: false,
                    resize: false,
                    isBest: isBest
                }
                this.waveform.addRegion(region);
                cs1++;
            })
        }
        this.waveform.on('region-in', e => {
            this.props.hitBar();
            if (e.data.sectionType !== undefined) { // has data!
                if (e.data.sectionType === DROP) {
                    this.numDropsPassed++;
                }
            }
        })

        this.waveform.on('region-out', e => {
            let thisSection = e.data;
            let computed = thisSection.computed;
            if (computed) {
                this.setState({
                    currSec: thisSection.sectionType,
                    currSectionAnalysis: {
                        begin: thisSection.begin,
                        endpoint: thisSection.endpoint,
                        comparisonLoudness: computed.comparisonLoudness,
                        differential: computed.differential,
                        sectionConfidence: computed.sectionConfidence,
                        conformedBegin: computed.comformedBegin,
                        conformedEnd: computed.comformedEnd,
                        oBegin: computed.oBegin,
                        oEnd: computed.oEnd,
                        sectionColor: thisSection.sectionColor,
                        goodForMix: thisSection.goodForMix,
                        isBest: thisSection.isBest,
                        sizeComparison: thisSection.sizeComparison,
                        is32: thisSection.is32
                    }
                })

                if (thisSection.sectionType === DROP && this.numDropsPassed > 1 && this.props.otherReady) {
                    this.props.playOtherTrack();
                    this.fadeOutSong();
                }
            } else {
                this.props.hitBar();
            }
        });

        this.waveform.on('ready', e => {
            console.log("------ READY TO GO! 1 ------");
            this.state.audioCtx.resume();
            if (!this.waveform.isPlaying()) {
                this.playPause();
                this.props.prepared();
            }
            this.waveform.setVolume(0.1);
        });

        this.waveform.on('play', e => {
            console.log(this.props.deckName, " JUST STARTED PLAYING GONNA FADE IT IN NOW OK");
            this.waveform.setVolume(0.1);
            this.fadeInSong();
        })
    }

    playPause() {
        // check if context is in suspended state (autoplay policy)
        if (this.state.audioCtx.state === 'suspended') {
            this.state.audioCtx.resume();

        }
        this.waveform.play(this.state.startingPos);
        if (this.state.playing !== this.waveform.isPlaying()) {
            this.setState({
                playing: this.waveform.isPlaying()
            });
        }
    }

    changeFilter(amount) {
        if (amount <= 14000) {
            this.state.audioSettings.lowpassF = amount;
            this.state.lowpassNode.frequency.value = amount;
        } else if (amount >= 20000) {
            let highpassAmount = amount - 20000;
            this.state.audioSettings.highpassF = highpassAmount;
            this.state.highpassNode.frequency.value = this.state.audioSettings.highpassF;
        } else {
            this.state.audioSettings.lowpassF = 30000;
            this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
            this.state.audioSettings.highpassF = 0;
            this.state.highpassNode.frequency.value = this.state.audioSettings.highpassF;
        }
    }

    changeGain(amount) {
        // console.log("this ran")
        this.setState({
            audioSettings: {
                gain: (amount / 100).toPrecision(2)
            }
        })
        this.waveform.setVolume((amount / 100).toPrecision(2) || 1);
    }

    handlePosChange(e) {
        this.setState({
            pos: e
        });
    }

    fadeOutSong() {
        console.log("fading out");
        this.fadingOut = true;
        this.waveform.setVolume(lerp(this.waveform.getVolume(), 0, Math.max(this.waveform.getVolume() / 2), 0.1, this.props.deckName));
        this.state.lowpassNode.frequency.value -= (this.state.lowpassNode.frequency.value / 10);
        if (this.waveform.getVolume() < 0.2) this.waveform.setVolume(this.waveform.getVolume() - 0.03);
        if (this.waveform.getVolume() > 0.001) {
            setTimeout(() => {
                this.fadeOutSong();
            }, 1000);
        } else {
            console.log(">>>>>>>   >>> ", this.props.deckName, " FADED OUT_________");
            this.fadingOut = false;
            this.waveform.setVolume(0);
            this.waveform.pause();
            this.props.finished();
        }
    }

    fadeInSong() {
        console.log("*****", this.props.deckName, "fading in", this.props.recommendedVolume);
        // todo something with this.props.recommendedVolume
        // if (!this.props.recommendedVolume) { // TODO PASS IN PROP TO NORMALIZE VOLUME AMONGST BOTH SONGS
        //     this.waveform.setVolume(1); 
        // } else {
        //     this.waveform.setVolume(this.props.recommendedVolume);
        // }
        this.fadingIn = true;
        console.log(this.props.recommendedVolume);
        this.waveform.setVolume(lerp(this.waveform.getVolume(), this.props.recommendedVolume, Math.min((this.waveform.getVolume()) / 4), 0.05, this.props.deckName));
        // if (this.waveform.getVolume() < 0.2) this.waveform.setVolume(this.waveform.getVolume() - 0.03);
        if (this.waveform.getVolume() < this.props.recommendedVolume - 0.1) {
            setTimeout(() => {
                this.fadeInSong();
            }, 1000);
        } else {
            console.log(">>>>>>>  !!!  >>> ", this.props.deckName, " FADED IN_________!!!!");
            this.fadingIn = false;
            this.waveform.setVolume(this.props.recommendedVolume);
        }
    }

    render() {
        return (
            <>
                <div className={"deck"}>
                    {this.props.songName !== "" && <h3>{this.props.songName} by {this.props.songArtist}</h3>}
                    <Knob size={70} numTicks={70} degrees={260} min={0} max={100} value={50} color={true} onChange={this.changeGain} />
                    <label>GAIN</label>
                    <Knob size={70} numTicks={70} degrees={260} min={1000} max={30000} value={15000} color={true} onChange={this.changeFilter} />
                    <label>FILTER</label>
                    <button className={"playButton"} onClick={() => { this.playPause() }}>{this.state.playing ? "Pause" : "Play"}</button>
                    <div id="waveform" />
                    <div id="wave-timeline" />
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
}

function lerp(start, end, amt, deckname) {
    console.log(deckname, "lerped this:", start, end, amt, "to:", (1 - amt) * start + amt * end);
    return (1 - amt) * start + amt * end
}

