import React, { useState, useEffect, useCallback } from 'react';
import TrackFinder from "./helper_classes/TrackFinder";
import { thoughtType, trackAlreadyIn, tracklistSize } from "./Mixbot";
import { Gateway } from './helper_classes/Gateway';
/**
 * 
 * * 1. (playlistSearchClicked) Choose Playlist
 * * 2. (chooseSong) Chooses song
 *                     - Check if song hasn't been already played
 * *    Keep choosing songs until !addMoreSongs
 * * 3. <TrackFinder/> For each song, find YouTube video ID for song
 *                     - If can't find song, remove song from options and try again
 *                     - If found song, call addSongToTracklist
 * * 4. (addSongToTracklist) Check if song still hasn't been added to tracklist
 *                     - If has, repeat process
 *                     - If hasn't, get audio analysis for song
 * * 5. (getAudioAnalysis) Get audio analysis, then add it to tracklist
 */
const MixType = {
    EURO_HOUSE: 1,
    CHILL_HOUSE: 2,
    TECH_HOUSE: 3,
}

let currentMix = null; // meant to be a mixType
const euroHouseMix_1 = "2818tC1Ba59cftJJqjWKZi";
const euroHouseMix_2 = "1fWDDXepy50hFXLhwGR5xP";
const chillMix_1 = "52yAobXW9CokfKnLhe3C8Z";
const chillMix_2 = "6el7EnAXJJ2kvnoBDvWXvk";
const techHouseMix_1 = "7HRYveKYzLJFqb1PTJejoL";

let chosenPlaylist = null;

let gateway = new Gateway();
// let numChosen = 0;
// let numLimit = 100;

function getMixText() {
    switch (currentMix) {
        case MixType.EURO_HOUSE:
            return "Euro House Mix";
        case MixType.TECH_HOUSE:
            return "Tech House Mix";
        case MixType.CHILL_HOUSE:
            return "Chill House Mix";
        default:
            break;
    }
}
function TrackSelector({ addToQueue, addMoreSongs, newThought, mixChosen }) {
    const [playlist, setPlaylist] = useState({ selectedPlaylist: null, listOfPlaylistFromAPI: [] });
    const [tracks, setTracks] = useState({ selectedTrack: '', listOfTracksFromAPI: [] });
    const [trackDetail, setTrackDetail] = useState(null);
    const [chosenMix, setChosenMix] = useState(false);

    function changeChosen(playlist) {
        if (playlist === 1) { // euro house
            currentMix = MixType.EURO_HOUSE;
            chosenPlaylist = Math.random() > 0.5 ? euroHouseMix_1 : euroHouseMix_2;
        } else if (playlist === 2) {
            currentMix = MixType.CHILL_HOUSE;
            chosenPlaylist = Math.random() > 0.5 ? chillMix_1 : chillMix_2;
        } else {
            currentMix = MixType.TECH_HOUSE;
            chosenPlaylist = techHouseMix_1;
        }

        setPlaylist({ selectedPlaylist: chosenPlaylist });
        setChosenMix(true);
    }

    function playlistSearchClicked(e) {
        e.preventDefault();
        // numChosen = 0;
        gateway.getPlaylist(playlist.selectedPlaylist).then(tracksResponse => {
            console.log('got tracks', tracksResponse);
            setTracks({
                selectedTrack: tracks.selectedTrack,
                listOfTracksFromAPI: tracksResponse
            })

            mixChosen(getMixText());
        });
    }

    const chooseSong = useCallback((choiceSelections) => {
        let selected = choiceSelections[Math.floor(Math.random() * (choiceSelections.length - 1))];
        if (!trackAlreadyIn(selected.track.id)) {
            const currentTracks = [...tracks.listOfTracksFromAPI];
            const trackInfo = currentTracks.filter(t => t.id === selected.id);
            setTrackDetail(trackInfo[0]);
        }
    });

    useEffect(() => {
        if (tracks.listOfTracksFromAPI.length > 0) {
            if (trackDetail == null && addMoreSongs)
                chooseSong(tracks.listOfTracksFromAPI)
        }
    }, [tracks, trackDetail, addMoreSongs, chooseSong])

    async function addSongToTracklist(songName, songArtists, duration, songURL, trackID, trackImage, youtubeVideoID, fromDatabase) {
        if (!trackAlreadyIn(trackID))
            await getAudioAnalysis(trackID, songName, songArtists, duration, songURL, trackImage, youtubeVideoID, fromDatabase);
        else
            setTrackDetail(null);
    }

    const getAudioAnalysis = async (id, songName, songArtists, duration, songURL, trackImage, youtubeVideoID, fromDatabase) => {
        let analysisInDB = await gateway.checkAnalysisDB(id);
        let takenFromDB = !analysisInDB;
        if (takenFromDB) {
            console.log("we are going to get analysis from spotify");
            analysisInDB = await gateway.getSpotifyAnalysis(id);
            console.log("got analysis", analysisInDB);
            let dbAnalysis = {
                songID: id,
                songName: songName,
                analysis: analysisInDB.body
            }
            analysisInDB = dbAnalysis;
        }

        await addToQueue(songName, songArtists, duration, songURL, analysisInDB, trackImage, id, youtubeVideoID, fromDatabase); 
        // numChosen++;
        setTrackDetail(null);
        // if (numChosen >= numLimit - 10) {
        //     playlistSearchClicked();
        // }
    }

    const couldntBeFound = (alreadyDB) => {
        if (!alreadyDB) {
            const think = "Unable to add " + trackDetail.name;
            newThought(think, thoughtType.FAILURE);
        }
        setTrackDetail(null);
    }

    return (
        <div className="selector-wrapper">
            {chosenMix ? <h1>{getMixText()}</h1> : <h1>Select a mix</h1>}
            <div className="playlist-select">
                {tracklistSize() === 0 && <button onClick={() => changeChosen(1)}>EURO HOUSE</button>}
                {tracklistSize() === 0 && <button onClick={() => changeChosen(2)}>CHILL HOUSE</button>}
                {tracklistSize() === 0 && <button onClick={() => changeChosen(3)}>TECH HOUSE</button>}
            </div>

            <form onSubmit={playlistSearchClicked}>
                {chosenMix && tracklistSize() === 0 && <button className="begin-mix">Begin mix</button>}
                <div style={{ marginTop: "4em" }}>
                    <TrackFinder
                        trackDetail={trackDetail}
                        foundSong={addSongToTracklist}
                        cantFind={couldntBeFound} />
                </div>
            </form>
        </div>
    );
}

export default TrackSelector;
