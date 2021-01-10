import React, { useState, useEffect } from 'react';
import Dropdown from "./frontend_components/Dropdown";
import { Credentials } from './Credentials';
import axios from 'axios';
import Listbox from "./frontend_components/Listbox";
import Detail from "./frontend_components/Detail";
import TrackFinder from "./TrackFinder";
import TrackPlayer, { trackAlreadyIn, addToQueue } from "./TrackPlayer";

const euroHouseID = "2818tC1Ba59cftJJqjWKZi";

function TrackSelector() {
    const spotify = Credentials();
    const [token, setToken] = useState('');
    const [genres, setGenres] = useState({ selectedGenre: '', listOfGenresFromAPI: [] });
    const [playlist, setPlaylist] = useState({ selectedPlaylist: '2818tC1Ba59cftJJqjWKZi', listOfPlaylistFromAPI: [] });
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
                // axios('https://api.spotify.com/v1/browse/categories', {
                //     method: 'GET',
                //     headers: { 'Authorization' : 'Bearer ' + tokenResponse.data.access_token}
                // })
                //     .then (genreResponse => {
                //         console.log(genreResponse)
                //         setGenres({
                //             selectedGenre: genres.selectedGenre,
                //             listOfGenresFromAPI: genreResponse.data.categories.items
                //         })
                //     });

            });

    }, [genres.selectedGenre, spotify.ClientId, spotify.ClientSecret]);

    function genreChanged(val) {
        setGenres({
            selectedGenre: val,
            listOfGenresFromAPI: genres.listOfGenresFromAPI
        });

        axios(`https://api.spotify.com/v1/browse/categories/${val}/playlists?limit=30`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(playlistResponse => {
            setPlaylist({
                selectedPlaylist: playlist.selectedPlaylist,
                listOfPlaylistFromAPI: playlistResponse.data.playlists.items
            })
        });
    }

    function playlistChanged(val) {
        setPlaylist({
            selectedPlaylist: val,
            listOfPlaylistFromAPI: playlist.listOfPlaylistFromAPI
        });
    }

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
            console.log(">>>",trackInfo[0].track);
            setTrackDetail(trackInfo[0].track);
        } else {
            console.log("track is already in the queue");
        }
    }

    async function addSongToTracklist(songName, songArtists, duration, songURL, trackID, trackImage) {
        if (!trackAlreadyIn(songName)) {
            console.log("adding: " + songName + "with id " + trackID);
            getAudioAnalysis(trackID, songName, songArtists, duration, songURL, trackImage);
        } else {
            console.log("track is already in the queue");
            setTrackDetail(null);
        }
    }
    
    const getAudioAnalysis = (id, songName, songArtists, duration, songURL, trackImage) => {
        console.log("song id is " + id);
        axios(`https://api.spotify.com/v1/audio-analysis/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }).then(e => {
            console.log(e);
            addToQueue(songName, songArtists, duration, songURL, e, trackImage);
        }).catch(e => {
            addToQueue(songName, songArtists, duration, songURL, "NOTFOUND", trackImage);
            console.log(e);
        }).finally(() => {
            setTrackDetail(null);
        });
    }

    return (
        <div>
            <TrackPlayer />
            <form onSubmit={playlistSearchClicked}>
                {/* <Dropdown label="Genre: " options={genres.listOfGenresFromAPI} selectedValue={genres.selectedGenre} changed={genreChanged} /> */}
                {/* <Dropdown label="Playlist: " options={playlist.listOfPlaylistFromAPI} selectedValue={playlist.selectedPlaylist} changed={playlistChanged} /> */}
                {playlist.selectedPlaylist !== "" ? <button type='submit' className="begin-mix">BEGIN MIX</button> : null}
                <div>
                    <Listbox items={tracks.listOfTracksFromAPI} clicked={selectTrack} />
                    {trackDetail && <Detail {...trackDetail} />}
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
