import axios from 'axios';

// const KEY = "AIzaSyBCi78Sxufce46Ly228JC2BUO9SdShyeFw";
const KEY = "AIzaSyCPQdzSiIGvT8rdVBy6ZBdW25nUYC7JzI8";
// const KEY = "AIzaSyC6F5gJnOX3mS2dl5-b_82PQ2ow7Xikuw8";
export default axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: {
        part:'snippet',
        maxResults:3,
        key:KEY
    },
    headers:{}
})