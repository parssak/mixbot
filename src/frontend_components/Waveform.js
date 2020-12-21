import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from 'wavesurfer.js';
//https://codesandbox.io/s/audio-player-with-wavesurferjs-react-bd499?from-embed=&file=/src/Waveform.js:0-60
const formWaveSurferOptions = ref => ({
    container: ref,
    waveColor: "#beb9b9",
    progressColor: "#9a68c9",
    cursorColor: "#dac4f0",
    // barWidth: 3,
    // barRadius: 3,
    responsive: true,
    // height: 150,
    // If true, normalize by the maximum peak instead of 1.0.
    // normalize: true,
    // Use the PeakCache to improve rendering speed of large waveforms.
    partialRender: true,
});

export default function Waveform({ url, onPositionChange, isPlaying }) {
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const [playing, setPlay] = useState(false);
    const [volume, setVolume] = useState(0);

    // create new WaveSurfer instance
    // On component mount and when url changes
    useEffect(() => {
        setPlay(false);

        const options = formWaveSurferOptions(waveformRef.current);
        wavesurfer.current = WaveSurfer.create(options);
        wavesurfer.current.load(url.src);
        wavesurfer.current.on("ready", function() {
            // https://wavesurfer-js.org/docs/methods.html
            // wavesurfer.current.play();
            // setPlay(true);

            // make sure object stillavailable when file loaded
            if (wavesurfer.current) {
                wavesurfer.current.setVolume(volume);
                setVolume(volume);
            }
        });

        // Removes events, elements and disconnects Web Audio nodes.
        // when component unmount
        return () => wavesurfer.current.destroy();
    }, [url]);

    useEffect(() => {
        console.log("!!!")
        if (isPlaying !== playing) {
            handlePlayPause();
        }
        wavesurfer.current.on('audioprocess', function () {
            // $('.waveform__counter').text( formatTime(wavesurfer.getCurrentTime()) );
            // console.log(wavesurfer.current.getCurrentTime());
            console.log("--")
            onPositionChange(wavesurfer.current.getCurrentTime());

        });
    }, [url, isPlaying]);


    const handlePlayPause = () => {
        console.log("switching this");
        setPlay(!playing);
        wavesurfer.current.playPause();
    };

    // const onVolumeChange = e => {
    //     const { target } = e;
    //     const newVolume = +target.value;
    //
    //     if (newVolume) {
    //         setVolume(newVolume);
    //         wavesurfer.current.setVolume(newVolume || 1);
    //     }
    // };

    return (
        <div className={"waveform-comp"}>
            <div id="waveform" ref={waveformRef} />
            <div className="controls">
                <button onClick={handlePlayPause}>{!playing ? "Play" : "Pause"}</button>
                {/*<input*/}
                {/*    type="range"*/}
                {/*    id="volume"*/}
                {/*    name="volume"*/}
                {/*    // waveSurfer recognize value of `0` same as `1`*/}
                {/*    //  so we need to set some zero-ish value for silence*/}
                {/*    min="0.01"*/}
                {/*    max="1"*/}
                {/*    step=".025"*/}
                {/*    onChange={onVolumeChange}*/}
                {/*    defaultValue={volume}*/}
                {/*/>*/}
            </div>
        </div>
    );
}