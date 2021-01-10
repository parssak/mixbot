const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const axios = require('axios');
const cors = require('cors');



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
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

    // Request methods you wish to allow
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');


    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
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
        // console.log("req:",req.query);
        console.log("result:::");
        console.log(res);
        res.send(e.data);
    }).catch(e => {
        console.log(e);
    })
})


app.get('/youtubeDetail', function (req, res) {
    axios.create({
        baseURL: 'https://www.googleapis.com/youtube/v3',
        params: {
            part: 'contentDetails',
            key: req.query.key
        },
        headers: {}
    }).get("/search", {
        params: {
            id: req.query.id
        }
    }).then(e => {
        console.log("result:");
        console.log(res);
        res.send(e.data);
    }).catch(e => {
        console.log(e);
    })
})

app.listen(process.env.PORT || 8080)
console.log("listening!");