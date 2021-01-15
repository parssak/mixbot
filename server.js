const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const axios = require('axios');
const ytdl = require('ytdl-core');
const mixbotDB = require('./connection');


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
        console.log(e.response);
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
        let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        res.send(audioFormats);
    }).catch(e => {
        console.log("-------------error response-------------");
        console.log(e);
        res.sendStatus(500);
    });
})

//** Add song reference to the database */
app.get('/addReference', function (req, res) { // todo
    console.log(">>>(SERVER): adding reference...", req.query.data.songID);
    let songEntry = req.query.data;
    mixbotDB.addReference(songEntry);
    res.sendStatus(200);
});

//** Check's if song is already in database with Spotify ID */
app.get('/checkReference', async function (req, res) { // todo
    console.log(">>>(SERVER): checking for entry...", req.query.data.songID);
    let result = await mixbotDB.checkReference(req.query.data);
    res.send(result);
});

//** Add song analysis to the database */
app.get('/addAnalysis', function (req, res) { 
    console.log(">>>(SERVER): adding analysis...", req.query.data.songID);
    let songEntry = req.query.data;
    mixbotDB.addAnalysis(songEntry);
    res.sendStatus(200);
});

//** Check's if song is already in database with Spotify ID */
app.get('/checkAnalysis', async function (req, res) { // todo
    console.log(">>>(SERVER): checking for analysis...", req.query.data);
    let result = await mixbotDB.checkAnalysis(req.query.data);
    res.send(result);
});

//** Check's if song is already in database with Spotify ID */
app.get('/checkWhitelist', async function (req, res) { // todo
    console.log(">>>(SERVER): checking for whitelist entry...");
    let result = await mixbotDB.checkWhitelist(req.query.data);
    res.send(result);
});

//** Add whitelist song to the database */
app.get('/addWhitelist', function (req, res) {
    console.log(">>>(SERVER): whitelisting entry...");
    let songEntry = req.query.data;
    mixbotDB.addWhitelist(songEntry);
    res.sendStatus(200);
});

//** Check's if programs version is up to date */
app.get('/checkUpdate', async function (req, res) { // todo
    console.log(">>>(SERVER): checking for whitelist entry...");
    let result = await mixbotDB.checkUpdate();
    res.send(result);
});

app.listen(process.env.PORT || 8080)
console.log("listening!");