import React, { useState, useEffect } from 'react';
import { Credentials } from './api/Credentials';
import axios from 'axios';
import Listbox from "./frontend_components/Listbox";
import { Analyzer } from './helper_classes/Analyzer';
import TrackFinder from "./helper_classes/TrackFinder";
import { trackAlreadyIn, tracklistSize } from "./Mixbot";
import { Gateway } from './helper_classes/Gateway';

const euroHouseID = "2818tC1Ba59cftJJqjWKZi";
let gateway = new Gateway();

function TrackSelector({ addToQueue }) {
    const spotify = Credentials();
    const [token, setToken] = useState('');
    const [playlist, setPlaylist] = useState({ selectedPlaylist: euroHouseID, listOfPlaylistFromAPI: [] });
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
            }
        }).then(tracksResponse => {
            setTracks({
                selectedTrack: tracks.selectedTrack,
                listOfTracksFromAPI: tracksResponse.data.items
            })
        });
    }

    function selectTrack(val) {
        const currentTracks = [...tracks.listOfTracksFromAPI];
        const trackInfo = currentTracks.filter(t => t.track.id === val);
        if (!trackAlreadyIn(trackInfo[0].track.name)) {
            setTrackDetail(trackInfo[0].track);
        } 
    }

    async function addSongToTracklist(songName, songArtists, duration, songURL, trackID, trackImage, youtubeVideoID, fromDatabase) {
        if (!trackAlreadyIn(songName)) {
            await getAudioAnalysis(trackID, songName, songArtists, duration, songURL, trackImage, youtubeVideoID, fromDatabase);
        } else {
            setTrackDetail(null);
        }
    }

    async function addSongAnalysisToDatabase(songID, songAnalysis, songName) {
        let dbAnalysis = {
            songID: songID,
            songName: songName,
            analysis: songAnalysis
        }
        await gateway.addToAnalysis(dbAnalysis);
    }

    const getAudioAnalysis = async (id, songName, songArtists, duration, songURL, trackImage, youtubeVideoID, fromDatabase) => {
        let analysisInDB = await gateway.checkAnalysisDB(id);

        if (!analysisInDB.data) {
            let rawAnalysis = await gateway.getSpotifyAnalysis(id, token);
            let songData = rawAnalysis.data;
            let analyzer = new Analyzer();
            let analyzedData = analyzer.analyzeSong(songData);
            analysisInDB = analyzedData;
            addSongAnalysisToDatabase(id, analyzedData, songName);
        }
        addToQueue(songName, songArtists, duration, songURL, analysisInDB, trackImage, id, youtubeVideoID, fromDatabase);
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
                        foundSong={addSongToTracklist} />}
                </div>
            </form>
        </div>
    );
}

export default TrackSelector;
