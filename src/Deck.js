import React, {useState} from 'react';
import Knob from './frontend_components/Knob';
const tempTrack = "https://r8---sn-cxaaj5o5q5-tt1y.googlevideo.com/videoplayback?expire=1608414650&ei=WiHeX43CLOSItQf065KQDA&ip=142.126.73.189&id=o-AAJBaJwAGx8B3_GJrES08jyEhH_QGhdYC6GuQQndqhy_&itag=251&source=youtube&requiressl=yes&mh=rs&mm=31%2C26&mn=sn-cxaaj5o5q5-tt1y%2Csn-vgqsknlz&ms=au%2Conr&mv=m&mvi=8&pcm2cms=yes&pl=24&gcr=ca&initcwndbps=1565000&vprv=1&mime=audio%2Fwebm&ns=7p6-huPA8cnX8iRRVq8n3lQF&gir=yes&clen=3788632&dur=222.601&lmt=1595575954110558&mt=1608392686&fvip=1&keepalive=yes&c=WEB&txp=2311222&n=t_Mzw3L5cEmB6FSWU&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cgcr%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgPBl1k_Up0F1hd3TmAo9PtzkcM4YnhEtS1q0E_vjX8NQCIQCaCE1baqVHMIUT6Ur5WAY884hpgrJc43BuHaerr4aJfQ%3D%3D&ratebypass=yes&sig=AOq0QJ8wRQIgaVxYgumdHmI3muG_2y-a8iIZakuBHaKpgjqhXd7pTdQCIQCHYoxiwQRM7oNB9zB1j_MUaungBqDjBnC4yeU9EroMvA%3D%3D";
// -- NODES --
// let filtNum=0;
// let volNum=1;
// const gainNode = audioCtx.createGain();
// gainNode.gain.value = 0.2;
// const lowpassNode = audioCtx.createBiquadFilter();
// lowpassNode.type = "lowpass";
// lowpassNode.frequency.value = 10000;
// lowpassNode.Q.value = 5;
// track.connect(gainNode).connect(lowpassNode).connect(audioCtx.destination);
//
//
// function changeFilter(amount) {
// //     console.log(amount.target.value);
//     filtNum = amount.target.value;
//     lowpassNode.frequency.value = filtNum;
// }

function changeVolume(amount) {
    console.log("vol is ", amount);
//     volNum = amount.target.value;
//     gainNode.gain.value = volNum;
}

export default class Deck extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false,
            trackName: "",
            trackArtist: "",
            audioCtx: new AudioContext(),
            audioElement: new Audio(tempTrack),
            value: { value: 10 },
            audioSettings: {
                gain: 1,
                lowpassF: 0,
                highpassF: 0,
                high: 1,
                mid: 1,
                low: 1,
            }
        };
        this.state.audioElement.crossOrigin = "anonymous";
        this.playPause = this.playPause.bind(this);
        this.changeLowpass = this.changeLowpass.bind(this);
        this.state.lowpassNode =  this.state.audioCtx.createBiquadFilter();
        this.state.lowpassNode.type = "lowpass";
        this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
        this.state.lowpassNode.Q.value = 5;
        const track = this.state.audioCtx.createMediaElementSource(this.state.audioElement);
        track.connect(this.state.lowpassNode).connect(this.state.audioCtx.destination);
    }

    changeValue(val) {
        this.setState({value:val})
    }

    playPause() {
        // check if context is in suspended state (autoplay policy)
        if (this.state.audioCtx.state === 'suspended') {
            //     console.log("was suspended, resuming");
            this.state.audioCtx.resume();
        }
        if (!this.state.isPlaying) {
            this.state.audioElement.play();
            this.state.isPlaying = true;
        } else {
            this.state.audioElement.pause();
            this.state.isPlaying = false;
        }
    }

    changeLowpass(amount) {
        console.log("lowpass is", amount)
        this.state.audioSettings.lowpassF = amount;
        this.state.lowpassNode.frequency.value = this.state.audioSettings.lowpassF;
    }

    render() {
        return (
            <>
                <div className={"mixboard"}>
                    {/*<label>GAIN</label>*/}

                    {/*<input className={"slider"} type="range" min="0" max="1" onChange={changeVolume} step="0.01"/>*/}
                    <Knob
                        size={100}
                        numTicks={25}
                        degrees={260}
                        min={1}
                        max={10000}
                        value={30}
                        color={true}
                        onChange={this.changeLowpass}
                    />
                    <label>LOWPASS</label>
                    {/*<input className={"slider"} type="range" min="0" max="10000" onChange={this.changeLowpass()} step="1"/>*/}
                    <button onClick={() => {
                        this.playPause()
                    }}>{this.state.isPlaying ? "Pause" : "Play"}</button>
                    {this.state.trackName !== "" && <h1>Currently playing: {this.state.trackName} by {this.state.trackArtist}</h1>}
                </div>


            </>
        );
    }
}