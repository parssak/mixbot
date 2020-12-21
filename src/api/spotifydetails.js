import axios from 'axios';

const KEY = "AIzaSyC6F5gJnOX3mS2dl5-b_82PQ2ow7Xikuw8";
export default axios.create(`https://api.spotify.com/v1/audio-analysis/${id}`, {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token
    }
})

()