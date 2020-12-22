import React, {Component} from 'react';
import Knob from './frontend_components/Knob';
import WaveSurfer from 'wavesurfer.js';
// import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
// import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
// import Waveform from "./frontend_components/Waveform";

const tempTrack = "https://r8---sn-cxaaj5o5q5-tt1y.googlevideo.com/videoplayback?expire=1608683629&ei=DTziX9T7BpmCir4PtcKm6AQ&ip=142.126.73.189&id=o-AMVicLbj0Gv2rQrVjovPek8wxxBV4FI5LMlCg6R1G6tz&itag=251&source=youtube&requiressl=yes&mh=rs&mm=31%2C26&mn=sn-cxaaj5o5q5-tt1y%2Csn-vgqs7nls&ms=au%2Conr&mv=m&mvi=8&pl=24&gcr=ca&initcwndbps=1700000&vprv=1&mime=audio%2Fwebm&ns=s_KJpKjwEsZZ8AheQ_gNizUF&gir=yes&clen=3788632&dur=222.601&lmt=1595575954110558&mt=1608661718&fvip=1&keepalive=yes&c=WEB&txp=2311222&n=P9s4oVIr7EC14Ztz&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cgcr%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRAIgRMh65mjTW6PwQwyNug7n8o3U7_emmK9tyYapXeysfYACIHepjV45GMhesgNEo1wTHgBd5QnjG5icCMtM_PqjfFo_&ratebypass=yes&sig=AOq0QJ8wRgIhANl_rwVxcCYUdSw5WCiK5WWQwGPeV6RqvmXBcFXpCmlMAiEAxuwr91Yd_by6vYdEcszyTD--r58Ll8EWI6QUANVTrYk%3D";
// const tempTrack = "https://www.mfiles.co.uk/mp3-downloads/franz-schubert-standchen-serenade.mp3";

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

        if (this.props.songAnalysis) {
            console.log("Got song analysis!");
            let sectionArray = this.props.songAnalysis.data.sections;


            sectionArray.forEach(e => {
                let randomColor = 'black';
                if (e.loudness >= -10) {
                    console.log("A");
                    randomColor = 'rgba(123,215,255,50)'
                } else if (e.loudness >= -20) {
                    console.log("B");
                    randomColor = 'rgba(123,255,123,50)'
                } else {
                    console.log("C");
                    randomColor = 'rgb(208,19,19,50)'
                }
                let endpoint = e.start+e.duration;
                let region = {
                    start:e.start,
                    end:endpoint,
                    attributes:{
                        label:e.confidence
                    },
                    data:{
                        loudness: e.loudness,
                        tempo: e.tempo,
                        tempo_confidence: e.tempo_confidence,
                        duration: e.duration,
                    },
                    color: randomColor,
                    drag: false,
                    resize: false
                    }
                this.waveform.addRegion(region);
                }
            )
        } else {
            console.log("song analysis not got, returned:");
            console.log(this.props.songAnalysis);

        }
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
                gain: amount/100
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
