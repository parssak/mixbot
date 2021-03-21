import React, { Component } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import './css_files/Deck.scss';
import { SectionType } from './helper_classes/Analyzer';
import { thoughtType } from './Mixbot';

let xhr = { cache: 'default', mode: 'cors', method: 'GET', credentials: 'same-origin', redirect: 'follow', referrer: 'client', headers: [{ 'Access-Control-Allow-Origin': '*' }] };
let isMasterPaused = false;

export default class Deck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pos: 0,
            locked: false,
            scheduledDemise: false,
            currSec: "NOT PLAYING",
            playing: false,
            trackName: this.props.songName,
            trackArtist: this.props.songArtist,
            audioCtx: new AudioContext(),
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
        this.takeOutSong = this.takeOutSong.bind(this);
        this.normalizePlayback = this.normalizePlayback.bind(this);
    }

    componentDidMount() {
        this.waveform = WaveSurfer.create(this.waveSurferOptions);

        this.waveform.on('error', e => {
            console.error(e);
        })     
        this.waveform.load(this.props.thisSong);
        this.waveform.setPlaybackRate(this.props.playbackRate);
        this.reconnectAudio();
    }

    componentDidUpdate(prevProps) {
        if (this.waveform.getVolume() < this.props.recommendedVolume &&
            !this.fadingIn &&
            !this.fadingOut) {
            this.waveform.setVolume(this.props.recommendedVolume);
        }
        
        if (this.props.thisSong !== prevProps.thisSong) { 
            this.waveform.pause();
            this.synced = false;
            this.numSuccessful = 0;
            this.totalOffset = 0;
            this.fadingOut = false;
            this.fadingIn = false;
            this.numDropsPassed = 0;

            this.waveform.destroy();
            this.waveform = WaveSurfer.create(this.waveSurferOptions);
            
            this.waveform.on('error', e => {
                //console.log("hit error:", e);
            })

            let dummy = new Audio(this.props.thisSong);
            this.waveform.load(dummy.src);
            this.waveform.setPlaybackRate(this.props.playbackRate);

            this.reconnectAudio();
        } 

        if (this.state.audioCtx.state !== 'suspended') {
            if (this.props.play !== this.waveform.isPlaying()) {
                if (!this.props.play) {
                    //console.log("~~~ SHOULD BE PAUSED NGL ~~~");
                    this.waveform.pause();
                } else {
                    this.playPause();
                }
            }
        }

        if (!this.props.shouldSync) {
            this.synced = true; // If this is the main track, don't sync it
            this.normalizePlayback();
            
        }

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
            //console.log(this.props.deckName, "-> about to sync");
            if (this.waveform.getCurrentTime() + this.props.offset > 1 && this.props.offset != 0) {
                this.lastAdjustTime = this.waveform.getCurrentTime();
                let adjustedOffset = this.props.offset;
                this.totalOffset = this.props.offset;
                let desiredTime = this.waveform.getCurrentTime() + this.props.offset;
                this.waveform.pause();
                this.waveform.skip(adjustedOffset);
                this.waveform.playPause();
                //console.log("%%%   ", this.props.deckName, " now we are at:", this.waveform.getCurrentTime(), "difference is:", desiredTime - this.waveform.getCurrentTime(), "offset diff:", (this.props.offset - desiredTime - this.waveform.getCurrentTime()));
            } else {
                //console.log(this.props.deckName, "-> didn't sync ");
            }
        }

        if (this.props.shouldRemove && !this.fadingOut && !this.shouldSync && this.props.otherPlaying) {
            this.takeOutSong();
        }

        if (this.props.masterPlay !== prevProps.masterPlay) {
            if (this.props.masterPlay) {
                this.waveform.pause();
                isMasterPaused = true;
            } else {
                if (this.waveform.isPlaying() !== this.props.play) {
                    this.waveform.play();
                } else {
                    isMasterPaused = false;
                }
            }
        }
    }

    normalizePlayback() {
        if (this.waveform.getPlaybackRate() !== 1) {
            let newRate = lerp(this.waveform.getPlaybackRate(), 1, 0.1, this.props.deckName);
            if (isFinite(newRate)) this.waveform.setVolume(newRate);
            if (Math.abs(1 - this.waveform.getPlaybackRate()) < 0.1) this.waveform.setPlaybackRate(1);
            else this.normalizePlayback();
        }
    }

    reconnectAudio() {
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
            let analyzed = this.props.songAnalysis.analysis.songSections;
            if (!analyzed) {
                console.log("error!!");
                console.log(this.props);
            }
            if (!analyzed) {
                console.log("NO ANALYZED!!", this.props)
            }
            
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

            let bars = this.props.songAnalysis.analysis.bars;
            bars.forEach(b => {
                this.waveform.addRegion(b);
            })
            this.setState({
                startingPos: this.props.songAnalysis.startPos
            })
        }
        this.waveform.on('region-in', e => {
            this.props.hitBar();
            // console.log(">>>> HIT BAR : DIFF", e.data.computed.differential, "COMPLOUD", e.data.computed.comparisonLoudness);
            if (e.data.computed.differential < 0) {
                if (this.props.otherReady && (this.waveform.getCurrentTime() / this.waveform.getDuration() > 0.4)) {
                    this.props.playOtherTrack();                                                 
                    //console.log(this.props.deckName, "good mixing spot");
                }
            }
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
                //console.log(this.props.deckName, " HAS FINISHED", this.waveform.getCurrentTime() / this.waveform.getDuration(), "OF ITS SONG");
                if (this.props.otherReady && (this.waveform.getCurrentTime() / this.waveform.getDuration() > 0.4)) {
                    if ((thisSection.sectionType === SectionType.DROP && this.numDropsPassed > 0) || thisSection.sectionType === SectionType.COMEDOWN) {
                        this.props.playOtherTrack();                                                 
                    } else if (this.waveform.getCurrentTime() / this.waveform.getDuration() > 0.7) {
                        this.props.playOtherTrack();
                    }
                }
            } else {
                this.props.hitBar();
            }
        });

        this.waveform.on('ready', e => {
            //console.log("------ READY TO GO! 1 ------");
            this.state.audioCtx.resume();
            if (!this.waveform.isPlaying()) {
                this.playPause();
                this.props.prepared();
            }
            this.waveform.setVolume(0.01);
        });

        this.waveform.on('play', e => {
            
            if (this.props.play) {
                // console.log(this.props.deckName, " JUST STARTED PLAYING GONNA FADE IT IN NOW OK");
                if (isMasterPaused) {
                    console.log("was a master pause");
                    isMasterPaused = false;
                } else {
                    this.waveform.setVolume(0.01);
                    let think = "Fading in " + this.props.deckName;
                    this.props.newThought(think, thoughtType.MIX);
                    this.fadeInSong();
                }
            }
            
        })

    }

    takeOutSong() {
        this.fadeOutSong();
        let think = "Fading out " + this.props.deckName;
        this.props.newThought(think, thoughtType.MIX);
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
    }

    handlePosChange(e) {
        this.setState({
            pos: e
        });
    }

    fadeOutSong() {
        this.fadingOut = true;
        this.waveform.setVolume(lerp(this.waveform.getVolume(), 0, Math.min(this.waveform.getVolume() / 3), 0.1, this.props.deckName));
        this.state.lowpassNode.frequency.value -= (this.state.lowpassNode.frequency.value / 10);
        if (this.waveform.getVolume() < 0.2) this.waveform.setVolume(this.waveform.getVolume() - 0.03);
        if (this.waveform.getVolume() > 0.01) {
            setTimeout(() => {
                this.fadeOutSong();
            }, 1000);
        } else {
            //console.log(">>>>>>>   >>> ", this.props.deckName, " FADED OUT_________");
            this.fadingOut = false;
            this.waveform.setVolume(0);
            this.waveform.pause();
            this.props.finished();
        }
    }

    fadeInSong() {
        this.fadingIn = true;
        let newVol = lerp(this.waveform.getVolume(), this.props.recommendedVolume, Math.min((this.waveform.getVolume()) / 4), 0.03, this.props.deckName);
        if (isFinite(newVol)) {
            if (newVol >= this.props.recommendedVolume) this.waveform.setVolume(this.props.recommendedVolume);
            else this.waveform.setVolume(newVol);
        }
        
        if (this.waveform.getVolume() < this.props.recommendedVolume - 0.05) {   // TODO TWEAK THIS BASED ON IF MAIN TRACK OR NOT
            setTimeout(() => {
                this.fadeInSong();
            }, 1000);
        } else {
            //console.log(">>>>>>>  !!!  >>> ", this.props.deckName, " FADED IN_________!!!!");
            this.fadingIn = false;
            this.waveform.setVolume(this.props.recommendedVolume);
            this.props.removeOther();
        }
    }

    skipSong() {
        this.takeOutSong();
        this.props.playOtherTrack();
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
                            <button onClick={() => this.skipSong()}>SKIP SONG</button>
                        </div>
                        <div id={`${this.props.waveformID}`} />
                    </div>
                    
                    {/* <Knob size={70} numTicks={70} degrees={260} min={0} max={100} value={50} color={true} onChange={this.changeGain} /> */}
                    {/* <Knob size={70} numTicks={70} degrees={260} min={1000} max={30000} value={15000} color={true} onChange={this.changeFilter} /> */}
                </div>
            </>
        );
    }
}

function lerp(start, end, amt, deckname) {
    return (1 - amt) * start + amt * end
}

