import React, {useState} from 'react';
import Knob from './frontend_components/Knob';
import Waveform from "./frontend_components/Waveform";
// const tempTrack = "https://r7---sn-cxaaj5o5q5-tt1ee.googlevideo.com/videoplayback?expire=1608588824&ei=uMngX7HJNv7B2_gP3Z-r6Aw&ip=142.126.73.189&id=o-AIVZ6rL_eejugyR0HpbGeF9Vmz3blVm2c6pqNfNUba_F&itag=251&source=youtube&requiressl=yes&mh=LL&mm=31%2C26&mn=sn-cxaaj5o5q5-tt1ee%2Csn-vgqsrnll&ms=au%2Conr&mv=m&mvi=7&pl=24&pcm2=no&initcwndbps=1531250&vprv=1&mime=audio%2Fwebm&ns=Xk5RZEdQ35HJsRwTLGpffmsF&gir=yes&clen=4411139&dur=260.061&lmt=1591475714601748&mt=1608566918&fvip=4&keepalive=yes&c=WEB&txp=5531432&n=SfhHh00q_7QSh3PFl&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cpcm2%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAJ6pJLOeNhgyMV1ssx0dQd82zMklkxhg32eW2KBOKyZtAiAPGlGEyW2mRlauMQ9dFl_3W71flG5f64_eTWp6vHQgxg%3D%3D&ratebypass=yes&sig=AOq0QJ8wRQIhAIf7fc6H0AgcXP6xkhsgmIbairOSnE3w9xy6MJhIeY2mAiBQxrHHy_3ITqFfpeMr64l77g8OMGnjKkqy8tCwt2wdsQ%3D%3D";
const tempTrack = "https://www.mfiles.co.uk/mp3-downloads/franz-schubert-standchen-serenade.mp3";
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
            // audioElement: new Audio(this.props.thisSong),
            audioElement: new Audio(tempTrack),
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
        if (amount <= 10000) {
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
        console.log(e);
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
                    <Knob size={70} numTicks={70} degrees={260} min={1} max={30000} value={15000} color={true} onChange={this.changeFilter}/>
                    <label>FILTER</label>
                    <button className={"playButton"} onClick={() => {this.playPause()}}>{this.state.playing ? "Pause" : "Play"}</button>
                    <Waveform url={this.state.audioElement} onPositionChange={this.handlePosChange} isPlaying={this.state.playing}/>
                </div>
            </>
        );
    }
}