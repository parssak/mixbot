import React, {useEffect, useState} from 'react';
import $ from 'jquery';


const int = 1231212312;
const float = 1231212.31;
const stringz = "1231212.31";

const arrayz = [1, 2, 4, 5, "apple", 234.1]

const objectz = {
    name: "hello",
    age: 1231241,
    height: 1.342,
    friends: ["bob", "adam"]
};
console.log(objectz.friends[1])


const youtubeAPIkey = "AIzaSyBQW8yBavbx_Zx7Kw-KB0tYj3uIHyIGD8A";

function TrackFinder({name, artists, duration_ms}) {

    const [songName, setSongName] = useState(name);
    const [songArtists, setSongArtists] = useState(artists);
    const [duration, setDuration] = useState(duration_ms);
    const [searchResults, setSearchResults] = useState([]);

    let apple = "hello world"; // string
    const aafsa = 1231; // int
    const asdsa = 1.2; // float

    function createSearchQuery() {
        let artistNames = [];
        songArtists.forEach(e => artistNames.push(e.name));
        console.log(artistNames);
        let searchQuery = songName + " ";
        artistNames.forEach(e => console.log(e)); //searchQuery.concat(e + ' ')
        console.log("SEARCH QUERY: "+searchQuery);
        return searchQuery;
    }

    function videoSearch(search,maxVideos) {
        const endpoint = "/www.googleapis.com/youtube/v3/search";
        $.get(endpoint + youtubeAPIkey + "&type=video&part=snippet&maxResults=" + maxVideos + "&q" + search).then( data => {
            console.log(data);
        });
    }

    function getVideos() {
        const search = createSearchQuery();
        // search youtube
        videoSearch(search, 5);
    }


    useEffect(() => {
        return () => {
            const searchQuery = createSearchQuery();

            // Search for songs
            // TODO left off here
        };
    }, []);

    return (
        <div>
            <h1>Hello world</h1>
            <h3>hi how are you</h3>
            <h2>very cool</h2>
            <button onClick={getVideos}>
                Search for song
            </button>
        </div>
    );
}

export default TrackFinder;