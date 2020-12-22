import React, {useState} from 'react';
import Knob from './frontend_components/Knob';
import Waveform from "./frontend_components/Waveform";
const tempTrack = "https://r3---sn-cxaaj5o5q5-tt1e6.googlevideo.com/videoplayback?expire=1608610815&ei=nx_hX4vIFYqQigSZ1KmYBw&ip=142.126.73.189&id=o-AM9ISVs3xKNDLHXtBGF1d7_KISJ8oIJs4aadgh0RPSsR&itag=251&source=youtube&requiressl=yes&mh=ys&mm=31%2C26&mn=sn-cxaaj5o5q5-tt1e6%2Csn-vgqs7nez&ms=au%2Conr&mv=m&mvi=3&pl=24&initcwndbps=1746250&vprv=1&mime=audio%2Fwebm&ns=JYjlW2BRn0WOl0ToSHx1hmQF&gir=yes&clen=3520629&dur=208.481&lmt=1574979188257302&mt=1608588765&fvip=3&keepalive=yes&c=WEB&txp=5531432&n=60yZrSdpH8w8KRAaZ&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRgIhAIINBe8OfMG6wT-lFloDYfrIXfaTNMNJPe3br4qdsBmBAiEAoMaCRCdwDUegc-2YLfLKULniG2P1VGD7ZPk7Bdeti6s%3D&ratebypass=yes&sig=AOq0QJ8wRQIgdwolAOIckS8PhXNOdVWUzc_vZqm4652bABCm0lmuIBECIQDa3gyZekQO25IIEYxY_gLIaJUxObKXAjTmTF8guVGgyw%3D%3D";
// const tempTrack = "https://www.mfiles.co.uk/mp3-downloads/franz-schubert-standchen-serenade.mp3";
function changeVolume(amount) {
    console.log("vol is ", amount);
//     volNum = amount.target.value;
//     gainNode.gain.value = volNum;
}


export default class Deck extends React.Component {
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

        this.state.lowpassNode =  this.state.audioCtx.createBiquadFilter();
        this.state.lowpassNode.type = "lowpass";
        this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
        this.state.lowpassNode.Q.value = 5;

        this.state.highpassNode =  this.state.audioCtx.createBiquadFilter();
        this.state.highpassNode.type = "highpass";
        this.state.highpassNode.frequency.value = this.state.audioSettings.highpassF;
        this.state.highpassNode.Q.value = 5;

        this.state.gainNode = this.state.audioCtx.createGain();
        this.state.gainNode.gain.value = this.state.audioSettings.gain;

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
        const track = this.state.audioCtx.createMediaElementSource(this.state.audioElement);
        track.connect(this.state.lowpassNode)
            .connect(this.state.highpassNode)
            .connect(this.state.gainNode)
            .connect(this.state.audioCtx.destination);
    }

    playPause() {
        // check if context is in suspended state (autoplay policy)
        if (this.state.audioCtx.state === 'suspended') {
            //     console.log("was suspended, resuming");
            this.state.audioCtx.resume();
        }
        if (!this.state.playing) {
            this.state.audioElement.play();
            this.setState({
                playing: true
            });
        } else {
            this.state.audioElement.pause();
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
        this.state.audioSettings.gain = amount/100;
        this.state.gainNode.gain.value = this.state.audioSettings.gain;
    }

    handlePosChange(e) {
        this.setState({
            pos: e
        });
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

    render() {
        return (
            <>
                <div className={"mixboard"}>
                    {this.state.trackName !== "" && <h3>{this.state.trackName} by {this.state.trackArtist}</h3>}
                    <Knob size={70} numTicks={70} degrees={260} min={0} max={200} value={100} color={true} onChange={this.changeGain}/>
                    <label>GAIN</label>
                    <Knob size={70} numTicks={70} degrees={260} min={1000} max={30000} value={15000} color={true} onChange={this.changeFilter}/>
                    <label>FILTER</label>
                    <button className={"playButton"} onClick={() => {this.playPause()}}>{this.state.playing ? "Pause" : "Play"}</button>
                    <Waveform url={this.state.audioElement} onPositionChange={this.handlePosChange} isPlaying={this.state.playing} audioCtx={this.state.audioCtx} lowpassNum={this.state.lowpassF}/>
                </div>
            </>
        );
    }
}