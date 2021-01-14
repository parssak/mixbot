import React, { useState, useEffect, useCallback } from 'react';
import { Credentials } from './api/Credentials';
import axios from 'axios';
import TrackFinder from "./helper_classes/TrackFinder";
import { thoughtType, trackAlreadyIn, tracklistSize } from "./Mixbot";
import { Gateway } from './helper_classes/Gateway';

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
let offset = 0;

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
    const spotify = Credentials();
    const [token, setToken] = useState('');
    const [playlist, setPlaylist] = useState({ selectedPlaylist: null, listOfPlaylistFromAPI: [] });
    const [tracks, setTracks] = useState({ selectedTrack: '', listOfTracksFromAPI: [] });
    const [trackDetail, setTrackDetail] = useState(null);
    const [chosenMix, setChosenMix] = useState(false);

    useEffect(() => {                                       // used for verification
        axios('https://accounts.spotify.com/api/token', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(spotify.ClientId + ':' + spotify.ClientSecret)
            },
            data: 'grant_type=client_credentials',
            method: 'POST'
        })
            .then(tokenResponse => {
                setToken(tokenResponse.data.access_token);
            });

    }, [spotify.ClientId, spotify.ClientSecret]);



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
        axios(`https://api.spotify.com/v1/playlists/${playlist.selectedPlaylist}/tracks?limit=40`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }, 
            params: {
                offset: offset
            }
        }).then(tracksResponse => {
            // console.log("----------------------------- GOT SONGS, OFFSETTING FROM", offset);
            // offset += 40;
            setTracks({
                selectedTrack: tracks.selectedTrack,
                listOfTracksFromAPI: tracksResponse.data.items
            })

            mixChosen(getMixText());
        });
    }

    const selectTrack = useCallback((val) => {
        if (!trackAlreadyIn(val)) {
            // console.log(">>>>>>>>>>>>>>>>>> Selected track");
            const currentTracks = [...tracks.listOfTracksFromAPI];
            const trackInfo = currentTracks.filter(t => t.track.id === val);
            setTrackDetail(trackInfo[0].track);
        }
        

        // const willAdd = !trackAlreadyIn(trackInfo[0].track.name);
        // console.log(">>>>>>>>>>>>>>>>>> 1 WAS", willAdd);
        // if (willAdd) {
            // setTrackDetail(trackInfo[0].track);
        // }
        // return willAdd;
        
        
    });

    const chooseSong = useCallback((choiceSelections) => {
        let selected = choiceSelections[Math.floor(Math.random() * (choiceSelections.length - 1))];
        selectTrack(selected.track.id);
    });

    useEffect(() => {
        if (tracks.listOfTracksFromAPI.length > 0) {
            // console.log("We have songs!");
            if (trackDetail == null && addMoreSongs) {
                // console.log("Adding another song!");
                chooseSong(tracks.listOfTracksFromAPI)
            }
        }
    }, [tracks, trackDetail, addMoreSongs, chooseSong])

    // TODO FIXING DUPLICATE SONG BUG
    async function addSongToTracklist(songName, songArtists, duration, songURL, trackID, trackImage, youtubeVideoID, fromDatabase) {
        // console.log(">>>>>>>>>>>>>>>>>> 2");
        if (!trackAlreadyIn(trackID)) {
            // console.log(">>>>>>>>>>>>>>>>>> 2 NOT IN YET GETTING ANALYSIS", songName);
            await getAudioAnalysis(trackID, songName, songArtists, duration, songURL, trackImage, youtubeVideoID, fromDatabase);
        } else {
            // console.log(">>>>>>>>>>>>>>>>>> 2 ALREADY IN SETTING DETAIL NULL", songName);
            setTrackDetail(null);
        }
    }

    async function addSongAnalysisToDatabase(dbObj) {
        // let dbAnalysis = {
        //     songID: songID,
        //     songName: songName,
        //     analysis: songAnalysis
        // }
        await gateway.addToAnalysis(dbObj);
    }

    const getAudioAnalysis = async (id, songName, songArtists, duration, songURL, trackImage, youtubeVideoID, fromDatabase) => {
        let analysisInDB = await gateway.checkAnalysisDB(id);
        let takenFromDB = !analysisInDB;
        if (takenFromDB) {
            analysisInDB = await gateway.getSpotifyAnalysis(id, token);
            let dbAnalysis = {
                songID: id,
                songName: songName,
                analysis: analysisInDB
            }
            analysisInDB = dbAnalysis;
            // let songData = rawAnalysis.data;
            // let analyzer = new Analyzer();
            
            // analysisInDB = analyzedData;
        }
        
        await addToQueue(songName, songArtists, duration, songURL, analysisInDB, trackImage, id, youtubeVideoID, fromDatabase); // ! todo added "Await" this 
        await addSongAnalysisToDatabase(analysisInDB);
        setTrackDetail(null);
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

            <h1>Select a mix</h1>
            {chosenMix && <h2>{getMixText()}</h2>}
            <div className="playlist-select">
                {tracklistSize() === 0 && <button onClick={() => changeChosen(1)}>EURO HOUSE</button>}
                {tracklistSize() === 0 && <button onClick={() => changeChosen(2)}>CHILL HOUSE</button>}
                {tracklistSize() === 0 && <button onClick={() => changeChosen(3)}>TECH HOUSE</button>}
            </div>
            
            <form onSubmit={playlistSearchClicked}>
                {chosenMix && tracklistSize() === 0 && <button className="begin-mix">Begin mix</button>}
                <div style={{ marginTop: "4em" }}>
                    {trackDetail && <TrackFinder name={trackDetail.name}
                        artists={trackDetail.artists}
                        duration_ms={trackDetail.duration_ms}
                        trackID={trackDetail.id}
                        trackImage={trackDetail.album.images[1]}
                        foundSong={addSongToTracklist}
                        cantFind={couldntBeFound}/>}
                </div>
            </form>
        </div>
    );
}

export default TrackSelector;
