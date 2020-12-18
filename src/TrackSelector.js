import React, {useState, useEffect} from 'react';
import Dropdown from "./frontend_components/Dropdown";
import { Credentials } from './Credentials';
import axios from 'axios';
import Listbox from "./frontend_components/Listbox";
import Detail from "./frontend_components/Detail";
import TrackFinder from "./TrackFinder";

let tracklist = [];
let currentSong = 0;

function addToQueue(songName, songArtists, duration_ms, songURL, analysis) {
    const newSong = {
        songName: songName,
        songArtists: songArtists,
        duration_ms: duration_ms,
        songURL: songURL,
        songAnalysis: analysis
    }
    tracklist.push(newSong);
}

function trackAlreadyIn(trackName) {
    console.log("checking if track is already in....", trackName);
    for (const trackObj of tracklist) {
        console.log(trackObj.songName)
        if (trackObj.songName === trackName)
            return true;
    }
    return false;
}
let audioElement = new Audio();

function TrackSelector() {
    const spotify = Credentials();
    const [token, setToken] = useState('');
    const [genres, setGenres] = useState({selectedGenre: '', listOfGenresFromAPI: []});
    const [playlist, setPlaylist] = useState({selectedPlaylist: '', listOfPlaylistFromAPI: []});
    const [tracks, setTracks] = useState({selectedTrack: '', listOfTracksFromAPI: []});
    const [trackDetail, setTrackDetail] = useState(null);

    useEffect(() => {
        axios('https://accounts.spotify.com/api/token', {
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(spotify.ClientId + ':' + spotify.ClientSecret)
            },
            data: 'grant_type=client_credentials',
            method: 'POST'
        })
            .then(tokenResponse => {
                setToken(tokenResponse.data.access_token);
                axios('https://api.spotify.com/v1/browse/categories', {
                    method: 'GET',
                    headers: { 'Authorization' : 'Bearer ' + tokenResponse.data.access_token}
                })
                    .then (genreResponse => {
                        console.log(genreResponse)
                        setGenres({
                            selectedGenre: genres.selectedGenre,
                            listOfGenresFromAPI: genreResponse.data.categories.items
                        })
                    });

            });

    }, [genres.selectedGenre, spotify.ClientId, spotify.ClientSecret]);

    const genreChanged = val => {
        setGenres({
            selectedGenre: val,
            listOfGenresFromAPI: genres.listOfGenresFromAPI
        });

        axios(`https://api.spotify.com/v1/browse/categories/${val}/playlists?limit=30`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        }).then(playlistResponse => {
            setPlaylist({
                selectedPlaylist: playlist.selectedPlaylist,
                listOfPlaylistFromAPI: playlistResponse.data.playlists.items
            })
        });
    }

    const playlistChanged = val => {
        setPlaylist({
            selectedPlaylist: val,
            listOfPlaylistFromAPI: playlist.listOfPlaylistFromAPI
        });
    }

    const buttonClicked = e => {
        e.preventDefault();
        axios(`https://api.spotify.com/v1/playlists/${playlist.selectedPlaylist}/tracks?limit=30`, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' + token
            }
        }).then(tracksResponse => {
            setTracks({
                selectedTrack: tracks.selectedTrack,
                listOfTracksFromAPI: tracksResponse.data.items
            })
        });
    }

    const selectTrack = val => {
        const currentTracks = [...tracks.listOfTracksFromAPI];
        const trackInfo = currentTracks.filter(t => t.track.id === val);
        if (!trackAlreadyIn(trackInfo[0].track.name)) {
            setTrackDetail(trackInfo[0].track);

        } else {
            console.log("track is already in the queue");
        }
    }

    const addSongToTracklist = async (songName, songArtists, duration, songURL, trackID) => {
        if (!trackAlreadyIn(songName)) {
            console.log("adding: " + songName);
            // let analysis = getAudioAnalysis(trackID);
            // console.log(analysis)
            let analysis = "";
            addToQueue(songName, songArtists, duration, songURL, analysis);
            console.log(tracklist);
            setTrackDetail(null);
        } else {
            console.log("track is already in the queue");
            setTrackDetail(null);
        }
    }



    function playSong() {
        // if (tracklist.length === 0) return;
        if (tracklist.length === 1 && audioElement.paused) {
            audioElement.load();
            audioElement = new Audio(tracklist[0].songURL)
        }
        if (audioElement.paused) {
            console.log("is paused")
            audioElement.play();
        } else {
            console.log("is playing")
            audioElement.pause();
        }
    }

    function loadNextSong() {
        console.log("currentSong: ",currentSong)
        audioElement.pause();
        audioElement.load();
        if (currentSong + 1 < tracklist.length) {
            currentSong += 1;
            setCurrentSong();
        }
    }

    function loadPreviousSong() {
        console.log("currentSong: ",currentSong)
        audioElement.pause();
        audioElement.load();
        if (currentSong - 1 >= 0) {
            currentSong -= 1;
            setCurrentSong();
        }
    }

    function setCurrentSong() {
        audioElement.pause();
        audioElement.src = tracklist[currentSong].songURL;
        audioElement.play();
    }

    return (
        <div>
            <form onSubmit={buttonClicked}>
                <Dropdown label="Genre: " options={genres.listOfGenresFromAPI} selectedValue={genres.selectedGenre} changed={genreChanged} />
                <Dropdown label="Playlist: " options={playlist.listOfPlaylistFromAPI} selectedValue={playlist.selectedPlaylist} changed={playlistChanged} />
                {playlist.selectedPlaylist !== "" ? <button type='submit'>
                    Search
                </button> : null}
                <div>
                    <Listbox items={tracks.listOfTracksFromAPI} clicked={selectTrack} />
                    {trackDetail && <Detail {...trackDetail} /> }
                    {trackDetail && <TrackFinder name={trackDetail.name}
                                                 artists={trackDetail.artists}
                                                 duration_ms={trackDetail.duration_ms}
                                                 trackID={trackDetail.id}
                                                 foundSong={addSongToTracklist}/>}
                </div>
            </form>
            {tracklist.length > 0 && <button onClick={() => {playSong()}}>PLAY SONG</button>}
            {currentSong + 1 < tracklist.length && <button onClick={() => {loadNextSong()}}>NEXT SONG</button>}
            {currentSong - 1 >= 0 && <button onClick={() => {loadPreviousSong()}}>PREVIOUS SONG</button>}
        </div>
    );
}

export default TrackSelector;
