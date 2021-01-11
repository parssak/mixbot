const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const axios = require('axios');
const ytdl = require('ytdl-core');

app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
    return res.send('pong');
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(function (req, res, next) {
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
        headers: {}
    }).get("/search", {
        params: {
            q: req.query.q,
        }
    }).then(e => {
        res.send(e.data);
    }).catch(e => {
        console.log("------------- error -------------");
        res.sendStatus(500);
    })
})

app.use(function (req, res, next) {
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
        headers: {}
    }).get("/videos", {
        params: {
            id: req.query.id
        }
    }).then(e => {
        res.send(e.data);
    }).catch(e => {
        console.log("------------- error -------------");
        console.log(e.response);
        res.sendStatus(500);
    })
})

app.use(function (req, res, next) {
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
    }).catch(e => {
        console.log("-------------error response-------------");
        console.log(e);
        res.sendStatus(500);
    });
})

app.listen(process.env.PORT || 8080)
console.log("listening!");