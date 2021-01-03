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
            }
        };
        this.playPause = this.playPause.bind(this);
        this.changeFilter = this.changeFilter.bind(this);
        this.changeGain = this.changeGain.bind(this);
        this.reconnectAudio = this.reconnectAudio.bind(this);
        this.analyzeData = this.analyzeData.bind(this);
        this.handlePosChange = this.handlePosChange.bind(this);
    }

    componentDidMount() {
        console.log("|| ---- COMPONENT DID MOUNT ---- ||");
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
        console.log("||| ---- COMPONENT DID UPDATE ---- |||");
        if (this.props.thisSong !== prevProps.thisSong) { // TODO LEFT OFF HERE, YOU WERE TRYING TO MAKE SWITCHING SONGS ON A SINGLE DECK WORK BC IT KEEPS PLAYING THE OLD ONE ALSO REGIONS AREN"T DISAPPEARING
            console.log("|| -- THE SONG CHANGED -- ||");
           
            this.waveform.pause();
            // this.waveform.empty();
            // this.waveform.setVolume(0);

            if (!this.waveform.isPlaying()) console.log(" Stopped playing ");
            else console.log(" Didn't stop playing! :/ ");

            this.waveform.destroy(); // TODO PS WE NEVER GOT AROUND TO TESTING WHAT DESTROY DOES
            this.waveform = WaveSurfer.create({
                container: '#waveform',
                waveColor: "#beb9b9",
                // progressColor: "#9a68c9",
                cursorColor: "#dac4f0",
                hideScrollbar: true,
                // responsive: true,
                // partialRender: true,
                normalize: false,
                height: 100,
                plugins: [
                    RegionPlugin.create(),
                ]
            });

            // this.state.audioElement.pause();
            this.state.audioElement.load();
            this.state.audioElement = new Audio(this.props.thisSong);
           
            // this.state.
            this.waveform.load(this.state.audioElement.src);
            this.waveform.setPlaybackRate(this.props.playbackRate);
            this.reconnectAudio();
        }

        if (this.state.audioCtx.state !== 'suspended') {
            if (this.props.play !== this.waveform.isPlaying()) {
                if (!this.props.play) {
                    console.log("~~~ SHOULD BE PAUSED NGL ~~~");
                    this.waveform.stop();
                } else {
                    console.log("should be allowed to play, gonna play now!");
                    this.playPause();
                    this.waveform.setVolume(this.state.audioSettings.gain);
                }
            } else {
                if (this.state.audioSettings.gain !== this.waveform.getVolume()) {
                    this.waveform.setVolume(this.state.audioSettings.gain);
                }
                console.log("everything's matching up quite nicely");
            }
        } else {
            console.log("Component updated, neverthethus we are still suspended");
        }
    }

    analyzeData() {
        console.log("Got song analysis!");
        // console.log(this.props.songAnalysis);
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


        // this is very sus !!!!!!!!!!!
        console.log("the time sig is", timeSig);
        let bar = this.props.songAnalysis.data.bars[0].duration;
        let barConfidence = 0;
        allBars.forEach(e => {
            if (e.confidence > barConfidence) {
                bar = e.duration;
                barConfidence = e.confidence;
            }
        })

        console.log("The most confident bar is:", bar, "with a confidence of ", barConfidence);

        // let bar = 1.93235;
        let barlength32 = bar * 2;
        let actuallength32 = bar * 8;
        // let beat = (1/(bpm/60).toPrecision(10)).toPrecision(10);
        // let barLength = (timeSig) * beat;
        console.log("BAR LENGTH IS", bar);

        let songDuration = this.props.songAnalysis.data.track.duration;
        console.log(allBars[0].start)
        let startingPoint = 0;


        let songBeginPoint = allBars[0].start;
        console.log("the song begin point is", songBeginPoint);
        console.log("--------------------------")

        let num32Bar = ((songDuration) / barlength32);
        console.log(num32Bar);

        for (let a = 0; a <= num32Bar; a++) {
            barStartArray.push(((a) * barlength32));
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
            currSection++;
            // let loudnessTag = 0;
            let sectionType = REGULAR;
            let is32length = false;

            let comparisonLoudness = (e.loudness - baselineLoudness) / baselineLoudness;
            // console.log("the comparison loudness of section", songSections.length, "is", comparisonLoudness);

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
            // if (Math.abs(offsetEnd) < 1) { // if the offset is under 2 seconds conform to calculated
            //     acceptedConformEnd = true;
            //     endpoint = closestEnd;
            //     // endpoint = beginpoint + actuallength32;
            // }
            // if (currSection > 1) {
            //     if (Math.abs(songSections[currSection - 2].endpoint - beginpoint) < 2) {
            //         acceptedConformBegin = true;
            //         beginpoint = songSections[currSection - 2].endpoint;
            //     }
            // } else if (Math.abs(offsetBegin) < 1 && sectionType !== BEGIN) { // if the offset is under 2 seconds conform to calculated
            //     acceptedConformBegin = true;
            //     beginpoint = closestBegin;
            // }

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
                sectionColor: randomColor,
                goodForMix: goodForMix
            }
            songSections.push(analysisSection);
        })



        return songSections;
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

            let analyzed = this.analyzeData();
            // console.log("this is analyzed");
            // console.log(analyzed);


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
                // console.log(section);
                let region = {
                    start: section.begin,
                    end: section.endpoint,
                    attributes: section.computed,
                    data: section,
                    color: thisSectionColor,
                    drag: false,
                    resize: false,
                    isBest: isBest
                    // loop: toLoop
                }
                // console.log("setting waveform color as:", region.color);
                // console.log("this section started at:", region.start);
                // console.log("this section ended at:", region.end);
                this.waveform.addRegion(region);
                cs1++;
            })


        } else {
            console.log("song analysis not got, returned:");
            console.log(this.props.songAnalysis);
        }

        this.waveform.on('region-in', e => {
            // $('.waveform__counter').text( formatTime(wavesurfer.getCurrentTime()) );
            // console.log(wavesurfer.current.getCurrentTime());

            /**
             * comparisonLoudness: comparisonLoudness,
                    differential: diff,
                    sectionConfidence: e.confidence,
                    conformedBegin: acceptedConformBegin,
                    conformedEnd: acceptedConformEnd,
                    oBegin: offsetBegin,
                    oEnd: offsetEnd
             */


            // console.log("Entered:", e);
            let thisSection = e.data;
            let computed = thisSection.computed;
            //! Good for debugging
            // console.log("thisSection:", thisSection);
            // console.log("computed:", computed);
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
                    isBest: thisSection.isBest
                }
            })
            // console.log(computed.comformedBegin);
            // console.log(computed.comformedEnd);
            // console.log("DA MONEYYYY ", this.state.currSectionAnalysis);

            if (thisSection.sectionType === COMEDOWN) {
                console.log("drop da beat");
                this.props.playOtherTrack();
            }

            // if (!this.state.scheduledDemise) {
            // if (thisSection.sectionType !== BEGIN && !this.state.scheduledDemise) {
            //     let scheduleTime = thisSection.endpoint - thisSection.begin
            //     console.log("passing out sched time", scheduleTime);
            //     this.props.schedule(scheduleTime);
            //     this.setState({
            //         scheduledDemise: true
            //     });

            // } else {
            //     console.log("ew gross begin lol / scheduled my demise oopsie >.<");
            // }
                
                // this.setState({
                //     scheduledDemise: true
                // });
            // }
            
            // todo call this.props.schedule(with something) here
        });

        this.waveform.on('ready', e => {
            console.log("------ READY TO GO! 1 ------");
            this.state.audioCtx.resume();
            if (!this.waveform.isPlaying()) {
                this.playPause();
                this.waveform.setVolume(0.0001);
                this.props.prepared();
            }
            this.setState({
                scheduledDemise: false
            });
            // if (this.state.audioCtx.state === 'suspended') {
            //         console.log("--- was suspended");
            //         this.state.audioCtx.resume();
            //         this.playPause();
            //         if (this.state.audioCtx.state === 'suspended') {
            //             console.log("--- lol still is u wot");
            //             this.setState({
            //                 locked: true
            //             });
            //         }
            // } else {
            //     console.log("--- wasn't even suspended lul");
            //         // this.playPause();
            //         // if props.play == true and not playing play the friggin song dude
            //         // if (this.props.play && !this.waveform.isPlaying()) {
                    // if (!this.waveform.isPlaying()) {
                    //     console.log("--- why aren't you playing stoopid, aha aha lemme fix dat");
                    //     this.playPause();
                    // }
            // }
        });
    }

    playPause() {
        // check if context is in suspended state (autoplay policy)
        if (this.state.audioCtx.state === 'suspended') {
            //     console.log("was suspended, resuming");
            this.state.audioCtx.resume();

        }
        console.log("called playPause");
        // this.waveform.play(this.props.startTime);
        console.log("||||||| started song at", this.props.startTime);
        this.waveform.playPause();
        if (this.state.playing !== this.waveform.isPlaying()) {
            this.setState({
                playing: this.waveform.isPlaying()
            });
        }

        if (this.state.audioCtx.state === 'suspended') {
            //     console.log("was suspended, resuming");
            // this.state.audioCtx.resume();
            console.log("still suspended!");

        }
        // if (!this.state.playing) {
        //     this.setState({
        //         playing: true
        //     });
        // } else {
        //     this.setState({
        //         playing: false
        //     });
        // }
    }

    changeFilter(amount) {
        // console.log(amount)
        if (amount <= 14000) {
            // console.log("A");
            this.state.audioSettings.lowpassF = amount;
            this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
        } else if (amount >= 20000) {
            // console.log("B");
            let highpassAmount = amount - 20000;
            this.state.audioSettings.highpassF = highpassAmount;
            this.state.highpassNode.frequency.value = this.state.audioSettings.highpassF;
        } else {
            // console.log("C");
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
                    {this.props.songName !== "" && <h3>{this.props.songName} by {this.props.songArtist}</h3>}
                    <div className={"deckanalysis"}>
                        <h2 style={{ color: `${this.state.currSectionAnalysis.sectionColor}`, fontWeight: 800 }}>{this.state.currSec}</h2>
                        <p>GFM:{this.state.currSectionAnalysis.goodForMix ? "YES" : "NO"}</p>
                        <p>BO:{this.state.currSectionAnalysis.isBest ? "YES" : "NO"}</p>
                        <p>COMP:{this.state.currSectionAnalysis.comparisonLoudness}</p>
                        <p>DIFF:{this.state.currSectionAnalysis.differential}</p>
                        <p>CONFB:{this.state.currSectionAnalysis.conformedBegin ? "YES" : "NO"}</p>
                        <p>CONFE:{this.state.currSectionAnalysis.conformedEnd ? "YES" : "NO"}</p>
                        {/* <label style={{ fontSize: "25px", fontWeight: 600}}>{this.state.currSectionAnalysis}</label>  */}
                    </div>


                    <Knob size={70} numTicks={70} degrees={260} min={0} max={100} value={50} color={true} onChange={this.changeGain} />
                    <label>GAIN</label>
                    <Knob size={70} numTicks={70} degrees={260} min={1000} max={30000} value={15000} color={true} onChange={this.changeFilter} />
                    <label>FILTER</label>
                    <button className={"playButton"} onClick={() => { this.playPause() }}>{this.state.playing ? "Pause" : "Play"}</button>
                    {/*<Waveform url={this.state.audioElement} onPositionChange={this.handlePosChange} isPlaying={this.state.playing} audioCtx={this.state.audioCtx} lowpassNum={this.state.lowpassF}/>*/}
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
