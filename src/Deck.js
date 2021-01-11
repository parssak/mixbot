import React, { Component } from 'react';
import Knob from './frontend_components/Knob';
import WaveSurfer from 'wavesurfer.js';
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import './css_files/Deck.scss';
import { SectionType } from './helper_classes/Analyzer';

let xhr = { cache: 'default', mode: 'cors', method: 'GET', credentials: 'same-origin', redirect: 'follow', referrer: 'client', headers: [{ 'Access-Control-Allow-Origin': '*' }] };

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
            // audioElement: new Audio(this.props.thisSong),
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

        this.waveSurferOptions = {
            container: `#${this.props.waveformID}`,
            waveColor: "#ffffff",
            cursorColor: "tomato",
            hideScrollbar: true,
            normalize: true,
            height: 70,
            barWidth: 1,
            barHeight: 0.5, // the height of the wave
            barRadius: 2,
            plugins: [
                RegionPlugin.create(),
            ],
            xhr: xhr
        }

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
        this.handlePosChange = this.handlePosChange.bind(this);
    }

    componentDidMount() {
        console.log("|| ---- COMPONENT DID MOUNT ---- ||", this.props.deckName);
        // wavesurfer begins here
        this.waveform = WaveSurfer.create(this.waveSurferOptions);


        this.waveform.on('loading', e => {
            console.log("loading:", e);
        })

        this.waveform.on('error', e => {
            console.log("hit error:", e);
        })
      
        console.log("MOUNT THISSONG>>>",this.props.thisSong);
        let dummy = new Audio(this.props.thisSong);
        // console.log(">>>!!!>>>", dummy.src);
        // console.log(">>>>!!!!???", dummy.src === this.props.thisSong);
        this.waveform.load(this.props.thisSong);

        // console.log(this.props.thisSong);
        // let ooga = this.props.thisSong;
        // console.log("ooga is:", ooga);
        // console.log("song src WAS:", song.src);
        // // song.src = this.props.thisSong;
        // song.crossOrigin = "anonymous";
        // console.log("loading song in mount >>>!", this.props.thisSong);
        
        // this.waveform.load("http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3");
        console.log("loaded song", this.waveform.src);
        this.waveform.setPlaybackRate(this.props.playbackRate);
        this.reconnectAudio();
    }

    componentDidUpdate(prevProps) {
        console.log("||| ---- COMPONENT DID UPDATE ---- |||", this.props.deckName);
        console.log("TRACK IMG:", this.props.songImage)
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

            this.waveform = WaveSurfer.create(this.waveSurferOptions);
            this.waveform.on('loading', e => {
                console.log("loading:", e);
            })

            this.waveform.on('error', e => {
                console.log("hit error:", e);
            })

            console.log("loading song in update >>>!", this.props.thisSong);
            let dummy = new Audio(this.props.thisSong);
            this.waveform.load(dummy.src);
            this.waveform.setPlaybackRate(this.props.playbackRate);

            this.reconnectAudio();
        } else {
            console.log("SONG DIDN'T CHANGE");
        }

        if (this.state.audioCtx.state !== 'suspended') {
            if (this.props.play !== this.waveform.isPlaying()) {
                if (!this.props.play) {
                    console.log("~~~ SHOULD BE PAUSED NGL ~~~");
                    this.waveform.pause();
                } else {
                    this.playPause();
                }
            }
        }

        if (!this.props.shouldSync) this.synced = true; // If this is the main track, don't sync it

        // If the offset between tracks is under 0.1 seconds and this is playing, this track is succesful
        // ! The margin of error of 0.1s is needed due to timing issues with WebAudio
        if (Math.abs(this.props.offset) < 0.1 && this.waveform.isPlaying()) {
            this.numSuccessful++;
            if (Math.abs(this.props.offset) < 0.05) this.numSuccessful++;
            if (this.numSuccessful >= 3) {
                this.synced = true;
            }
        }

        /**
         * IF:
         *  1) New offset passed in
         *  2) It has been over 5 seconds since the last time it was adjusted
         */
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
                console.log("%%%   ", this.props.deckName, "total offset:", this.totalOffset);
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

    reconnectAudio() {
        // this.state.audi1oElement.crossOrigin = "anonymous";
        console.log("reconnecting audio");
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
            let analyzed = this.props.songAnalysis.analyzed.songSections;
            
            analyzed.forEach(section => {
                let region = {
                    start: section.begin,
                    end: section.endpoint,
                    attributes: section.computed,
                    data: section,
                    color: section.sectionColor,
                    drag: false,
                    resize: false,
                }
                this.waveform.addRegion(region);
            })

            let bars = this.props.songAnalysis.analyzed.bars;

            bars.forEach(b => {
                this.waveform.addRegion(b);
            })
            this.setState({
                startingPos: this.props.songAnalysis.analyzed.startPos
            })
        }
        this.waveform.on('region-in', e => {
            this.props.hitBar();
            if (e.data.sectionType !== undefined) { // has data!
                if (e.data.sectionType === SectionType.DROP) {
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

                if (thisSection.sectionType === SectionType.DROP && this.numDropsPassed > 0 && this.props.otherReady) {
                    this.props.playOtherTrack();
                    // TODO ADD BRAIN
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
        this.fadingIn = true;
        console.log(this.props.recommendedVolume);
        this.waveform.setVolume(lerp(this.waveform.getVolume(), this.props.recommendedVolume, Math.min((this.waveform.getVolume()) / 4), 0.05, this.props.deckName));
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
                    <img src={this.props.songImage.url} alt="" />
                    <div className={"deck-content"}>
                        <div className={"deck-text"}>
                            {this.props.songName !== "" && <h2>{this.props.songName}</h2>}
                            {this.props.songName !== "" && <h3>{this.props.songArtist}</h3>}
                        </div>
                        <div className={"deck-text"}>
                            <h4>{this.props.bpm} BPM</h4>
                            {/* <h4>{this.props.bpm} BPM</h4> */}
                        </div>
                        <div id={`${this.props.waveformID}`} />
                    </div>
                    {/* <Knob size={70} numTicks={70} degrees={260} min={0} max={100} value={50} color={true} onChange={this.changeGain} />
                    <label>GAIN</label>
                    <Knob size={70} numTicks={70} degrees={260} min={1000} max={30000} value={15000} color={true} onChange={this.changeFilter} />
                    <label>FILTER</label> */}
                    {/* <button className={"playButton"} onClick={() => { this.playPause() }}>{this.state.playing ? "Pause" : "Play"}</button> */}
                </div>
            </>
        );
    }
}

function lerp(start, end, amt, deckname) {
    console.log(deckname, "lerped this:", start, end, amt, "to:", (1 - amt) * start + amt * end);
    return (1 - amt) * start + amt * end
}

