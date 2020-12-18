import axios from 'axios';

const KEY = "AIzaSyBCi78Sxufce46Ly228JC2BUO9SdShyeFw";

export default axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: {
        part:'contentDetails',
        key:KEY
    },
    headers:{}
})
