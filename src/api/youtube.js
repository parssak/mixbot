import axios from 'axios';
import {currentKey} from './keys.js'

export default axios.create({
    // baseURL: 'https://www.googleapis.com/youtube/v3',
    baseURL: 'http://localhost:8080',
    params: {
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Credentials': true,
        // 'Access-Control-Allow-Headers': 'Content-Type',
        // 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        part:'snippet',
        maxResults:3,
        key: currentKey
    },
    headers:{}
})