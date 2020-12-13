import axios from 'axios';

const KEY = "AIzaSyBQW8yBavbx_Zx7Kw-KB0tYj3uIHyIGD8A";

export default axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: {
        part:'contentDetails',
        key:KEY
    },
    headers:{}
})
