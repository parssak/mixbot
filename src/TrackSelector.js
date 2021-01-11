import React, { useState, useEffect } from 'react';
import { Credentials } from './Credentials';
import axios from 'axios';
import Listbox from "./frontend_components/Listbox";
import { Analyzer } from './helper_classes/Analyzer';
import TrackFinder from "./TrackFinder";
import { trackAlreadyIn, tracklistSize } from "./Mixbot";

const euroHouseID = "2818tC1Ba59cftJJqjWKZi";

function TrackSelector({ addToQueue }) {
    const spotify = Credentials();
    const [token, setToken] = useState('');
    const [genres, setGenres] = useState({ selectedGenre: '', listOfGenresFromAPI: [] });
    const [playlist, setPlaylist] = useState({ selectedPlaylist: euroHouseID, listOfPlaylistFromAPI: [] });
    const [tracks, setTracks] = useState({ selectedTrack: '', listOfTracksFromAPI: [] });
    const [trackDetail, setTrackDetail] = useState(null);

    useEffect(() => {
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

    }, [genres.selectedGenre, spotify.ClientId, spotify.ClientSecret]);

    function playlistSearchClicked(e) {
        e.preventDefault();
        console.log("selected playlist was" + playlist.selectedPlaylist);
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
            console.log(">>>", trackInfo[0].track);
            setTrackDetail(trackInfo[0].track);
        } else {
            console.log("track is already in the queue");
        }
    }

    async function addSongToTracklist(songName, songArtists, duration, songURL, trackID, trackImage, youtubeVideoID, fromDatabase) {
        if (!trackAlreadyIn(songName)) {
            console.log("adding: " + songName + "with id " + trackID);
            await getAudioAnalysis(trackID, songName, songArtists, duration, songURL, trackImage, youtubeVideoID, fromDatabase);
        } else {
            console.log("track is already in the queue");
            setTrackDetail(null);
        }
    }

    async function checkForSongAnalysis(songID) {
        console.log("boutta check songAnalysis");
        let result = null;
        if (songID) {
            result = await axios.get('http://localhost:8080/checkEntryAnalysis', {
                params:
                {
                    data: songID
                }
            });
        }
        return result.data;
    }

    async function addSongAnalysisToDatabase(songID, songAnalysis) {
        let dbAnalysis = {
            songID: songID,
            analysis: songAnalysis
        }
        await axios.get('http://localhost:8080/addAnalysis', {
            params:
            {
                data: dbAnalysis
            }
        });

        
    }

    const getAudioAnalysis = async (id, songName, songArtists, duration, songURL, trackImage, youtubeVideoID, fromDatabase) => {
        console.log("song id is " + id);

        // 1) Check if DB already contains songAnalysis
        let analysisInDB = await checkForSongAnalysis(id);
        
        console.log(">>>> !> >!> >!>:", analysisInDB);
        console.log("analysis in db??:", analysisInDB.data);

        // 2) If song does not contain
        if (!analysisInDB.data) {
            console.log("IT ISNT MUCHHHHHHHHHHH");
            let rawAnalysis = await axios(`https://api.spotify.com/v1/audio-analysis/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            // Clean up the spotify data
            let songData = rawAnalysis.data;
            let analyzer = new Analyzer();
            let analyzedData = analyzer.analyzeSong(songData);
            analysisInDB = analyzedData;
            addSongAnalysisToDatabase(id, analyzedData);
        }
        console.log(">>>>>>>>>>>>>>>>..... analysis in db sending out!", analysisInDB);
        addToQueue(songName, songArtists, duration, songURL, analysisInDB, trackImage, id, youtubeVideoID, fromDatabase);
        setTrackDetail(null);
    }

    return (
        <div style={{ marginTop: "15em" }}>
            <form onSubmit={playlistSearchClicked}>
                {tracklistSize() === 0 && <button type='submit' className="begin-mix">BEGIN MIX</button>}
                <div style={{ marginTop: "4em" }}>
                    <Listbox items={tracks.listOfTracksFromAPI} clicked={selectTrack} />
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
