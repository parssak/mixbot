const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const axios = require('axios');
const cors = require('cors');
const ytdl = require('ytdl-core');


app.use(express.static(path.join(__dirname, 'build')));


// use it before all route definitions
// app.use(cors({ origin: 'http://localhost:8080' }));

app.get('/ping', function (req, res) {
    return res.send('pong');
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/youtubeSearch', function (req, res) {
    axios.create({
        baseURL: 'https://www.googleapis.com/youtube/v3',
        params: {
            part: 'snippet',
            maxResults: 3,
            key: req.query.key
        },
        headers: {
            // 'Access-Control-Allow-Origin': 'http://localhost:8080',
        }
    }).get("/search", {
        params: {
            q: req.query.q,
        }
    }).then(e => {
        // console.log("req:",req.query);
        res.send(e.data);
    }).catch(e => {
        console.log("------------- er ror -------------");
        res.sendStatus(500);
    })
})

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/youtubeDetail', function (req, res) {
    axios.create({
        baseURL: 'https://www.googleapis.com/youtube/v3',
        params: {
            part: 'contentDetails',
            key: req.query.key
        },
        headers: {
            // 'Access-Control-Allow-Origin': 'http://localhost:8080',
        }
    }).get("/videos", {
        params: {
            id: req.query.id
        }
    }).then(e => {
        // console.log("----$$$$---- result: >>>>>>");
        // console.log(res);
        // console.log("--$$$$--$$$$--$$$$-- data >>>");
        // console.log(e.data);
        res.send(e.data);
    }).catch(e => {
        console.log("----$$$$---- ERROR ERROR: >>>>>>");
        console.log(e.response);
        res.sendStatus(500);
    })
})



app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/youtubeMp3', function (req, res) {
    console.log("REQUEST QUERY:", req.query);
    ytdl.getInfo(req.query.id, { quality: 'highestaudio' }).then(info => {
        console.log(">>>>>>>>>>>>>>>>>>>> GOT INFO --");
        console.log(info);
        console.log("<<<<<<<<<<<<<<<<<<<< END OF INFO --");
        let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        console.log(">>>>>>>>>>>>>>>>>>>>>>>> AUDIO FORMATS --");
        console.log(audioFormats);
        console.log("<<<<<<<<<<<<<<<<<<<<<<<< END OF FORMATS --");
        res.send(audioFormats);

        // foundSong(songName, songArtists, duration, audioFormats[0].url, trackID, trackImage);
        // setChosenVideoID("");
    }).catch(e => {
        console.log("-------------error response-------------");
        console.log(e);
        res.sendStatus(500);
    });
    // axios.create({
    //     baseURL: 'https://www.googleapis.com/youtube/v3',
    //     params: {
    //         part: 'contentDetails',
    //         key: req.query.key
    //     },
    //     headers: {
    //         // 'Access-Control-Allow-Origin': 'http://localhost:8080',
    //     }
    // }).get("/videos", {
    //     params: {
    //         id: req.query.id
    //     }
    // }).then(e => {
    //     console.log("----$$$$---- result: >>>>>>");
    //     console.log(res);
    //     console.log("--$$$$--$$$$--$$$$-- data >>>");
    //     console.log(e.data);
    //     res.send(e.data);
    // }).catch(e => {
    //     console.log("----$$$$---- ERROR ERROR: >>>>>>");
    //     console.log(e.response);
    //     res.sendStatus(500);
    // })
})





app.listen(process.env.PORT || 8080)
console.log("listening!");