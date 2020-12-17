import React, {useState, useEffect} from 'react';
import Dropdown from "./frontend_components/Dropdown";
import { Credentials } from './Credentials';
import axios from 'axios';
import Listbox from "./frontend_components/Listbox";
import Detail from "./frontend_components/Detail";
import TrackFinder from "./TrackFinder";

let tracklist = [];
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

        axios(`https://api.spotify.com/v1/browse/categories/${val}/playlists?limit=10`, {
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
        // console.log(val);
        setPlaylist({
            selectedPlaylist: val,
            listOfPlaylistFromAPI: playlist.listOfPlaylistFromAPI
        });
    }

    const buttonClicked = e => {
        e.preventDefault();
        axios(`https://api.spotify.com/v1/playlists/${playlist.selectedPlaylist}/tracks?limit=10`, {
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
            const trackName = trackInfo[0].track.name;
            const duration = trackInfo[0].track.duration_ms;
            console.log("name is :" + trackName);
        } else {
            console.log("track is already in the queue");
        }
    }

    async function getAudioAnalysis(id) {
        axios(`https://api.spotify.com/v1/audio-analysis/${id}`, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' + token
            }
        }).then(e => {
            return e;
        });
    }

    const addSongToTracklist = async (songName, songArtists, duration, songURL, trackID) => {
        if (!trackAlreadyIn(songName)) {
            console.log("adding: " + songName);
            const analysis = await getAudioAnalysis(trackID);
            console.log(analysis)
            addToQueue(songName, songArtists, duration, songURL, analysis);
            console.log(tracklist);
            setTrackDetail(null);
        } else {
            console.log("track is already in the queue");
            setTrackDetail(null);
        }
    }

    return (
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
    );
}

export default TrackSelector;
