import React, {useState} from 'react';
import Deck from "./Deck";
let tracklist = [];
let upcomingSongs = [];
let alreadyPlayed = [];

// --- Global Functions ---
export function addToQueue(songName, songArtists, duration_ms, songURL, analysis) {
    const newSong = {
        songName: songName,
        songArtists: songArtists,
        duration_ms: duration_ms,
        songURL: songURL,
        songAnalysis: analysis
    }
    console.log(songURL);
    tracklist.push(newSong);
    upcomingSongs.push(newSong);
}

export function trackAlreadyIn(trackName) {
    console.log("checking if track is already in....", trackName);
    for (const trackObj of tracklist) {
        console.log(trackObj.songName)
        if (trackObj.songName === trackName)
            return true;
    }
    return false;
}

export default function TrackPlayer() {
    const [deck1Song, setDeck1Song] = useState('');
    const [deck2Song, setDeck2Song] = useState('');

    function loadTrackA() {
        console.log("entered");
        let newSong = loadTrack();
        console.log("newSong is", newSong)
        if (newSong !== null) {
            setDeck1Song(newSong)
        }
    }

    function loadTrackB() {
        let newSong = loadTrack();
        if (newSong !== null) {
            setDeck2Song(newSong)
        }
    }

    function loadTrack() {
        let nextSong = null;
        if (upcomingSongs.length !== 0) {
            nextSong = upcomingSongs[0];
            alreadyPlayed.push(nextSong);
            upcomingSongs.shift();
        }
        return nextSong;
    }


    return (
        <div className={"djboard"}>
            <div className={"boardpanel"}>
                {tracklist.length !== 0 && <button className={"loadbutton"} onClick={() => loadTrackA()}>Load Track A</button>}
                {/*<Deck thisSong={deck1Song.songURL}/>*/}
                {deck1Song !== '' && <Deck thisSong={deck1Song.songURL} songName={deck1Song.songName} songArtist={deck1Song.songArtists[0].name}/>}
                {/*{deck1Song !== '' && {deck1Song.songAnalysis !== 'NOTFOUND'  && }}*/}
            </div>
            <div className={"boardpanel"}>
                {tracklist.length !== 0 && <button className={"loadbutton"} onClick={() => loadTrackB()}>Load Track B</button>}
                {deck2Song !== '' && <Deck thisSong={deck2Song.songURL} songName={deck2Song.songName} songArtist={deck2Song.songArtists[0].name}/>}
            </div>
        </div>
    );
}