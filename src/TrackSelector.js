import React, { useState, useEffect, useCallback } from 'react';
import { Credentials } from './api/Credentials';
import axios from 'axios';
import Listbox from "./frontend_components/Listbox";
// import { Analyzer } from './helper_classes/Analyzer';
import TrackFinder from "./helper_classes/TrackFinder";
import { thoughtType, trackAlreadyIn, tracklistSize } from "./Mixbot";
import { Gateway } from './helper_classes/Gateway';

const euroHouseID = "2818tC1Ba59cftJJqjWKZi";
const superChillHouseID = "52yAobXW9CokfKnLhe3C8Z";
const crimeID = "1Hve0lapmmb6ddgKd7KLmd";

const chosenPlaylist = superChillHouseID;

let gateway = new Gateway();
let offset = 0;

function TrackSelector({ addToQueue, addMoreSongs, newThought }) {
    const spotify = Credentials();
    const [token, setToken] = useState('');
    const [playlist, setPlaylist] = useState({ selectedPlaylist: chosenPlaylist, listOfPlaylistFromAPI: [] });
    const [tracks, setTracks] = useState({ selectedTrack: '', listOfTracksFromAPI: [] });
    const [trackDetail, setTrackDetail] = useState(null);

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
            console.log("----------------------------- GOT SONGS, OFFSETTING FROM", offset);
            offset += 40;
            setTracks({
                selectedTrack: tracks.selectedTrack,
                listOfTracksFromAPI: tracksResponse.data.items
            })
        });
    }

    const selectTrack = useCallback((val) => {
        const currentTracks = [...tracks.listOfTracksFromAPI];
        const trackInfo = currentTracks.filter(t => t.track.id === val);
        if (!trackAlreadyIn(trackInfo[0].track.name)) {
            setTrackDetail(trackInfo[0].track);
            return true;
        }
        return false;
    });

    const chooseSong = useCallback((choiceSelections) => {
        let selected = choiceSelections[Math.floor(Math.random() * (choiceSelections.length - 1))];
        selectTrack(selected.track.id);
    });

    useEffect(() => {
        if (tracks.listOfTracksFromAPI.length > 0) {
            console.log("We have songs!");
            if (trackDetail == null && addMoreSongs) {
                console.log("Adding another song!");
                chooseSong(tracks.listOfTracksFromAPI)
            }
        }
    }, [tracks, trackDetail, addMoreSongs, chooseSong])

    // TODO FIXING DUPLICATE SONG BUG
    async function addSongToTracklist(songName, songArtists, duration, songURL, trackID, trackImage, youtubeVideoID, fromDatabase) {
        if (!trackAlreadyIn(songName)) {
            await getAudioAnalysis(trackID, songName, songArtists, duration, songURL, trackImage, youtubeVideoID, fromDatabase);
        } else {
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
        
        addToQueue(songName, songArtists, duration, songURL, analysisInDB, trackImage, id, youtubeVideoID, fromDatabase);
        await addSongAnalysisToDatabase(analysisInDB);
        setTrackDetail(null);
    }

    const couldntBeFound = () => {
        const think = "Unable to add " + trackDetail.name;
        newThought(think, thoughtType.FAILURE);
        setTrackDetail(null);
    }

    return (
        <div>
            <form onSubmit={playlistSearchClicked}>
                {tracklistSize() === 0 && <button type='submit' className="begin-mix">BEGIN MIX</button>}
                <div style={{ marginTop: "4em" }}>
                    {/* <Listbox items={tracks.listOfTracksFromAPI} clicked={selectTrack} /> */}
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
