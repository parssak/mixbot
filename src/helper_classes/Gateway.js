import axios from 'axios';
const serverBaseURL = 'https://stark-reef-17924.herokuapp.com/';

const makeRequest = async (path, p) => {
    const res = await axios.get(serverBaseURL + path, {
        params: {
            data: p
        }
    })
    return res.data;
}

export class Gateway {
    async checkForUpdate(currVersion) {
        return await makeRequest('checkUpdate', { data: currVersion })
    }

    //*** ADDING DB*/
    async addToAnalysis(analysisObj) {
        return await makeRequest('addAnalysis', { data: analysisObj })
    }

    async addToWhitelist(whitelistObj) {
        return await makeRequest('addWhitelist', { data: whitelistObj })
    }

    async addToReference(referenceObj) {
        return await makeRequest('addReference', { data: referenceObj })
    }
    
    //*** GETTING DB */
    async checkReferenceDB(trackID) {
        return await makeRequest('checkReference', { data: trackID })
    }

    async checkAnalysisDB(trackID) {
        return await makeRequest('checkAnalysis', { data: trackID })
    }

    async checkWhitelistDB(trackID) {
        return await makeRequest('checkWhitelist', { data: trackID })
    }
    
    //*** SPOTIFY */
    async getPlaylist(playlistID) {
        return await makeRequest('playlist', { playlistID: playlistID })
    }

    async getSpotifyAnalysis(songID) {
        return await makeRequest('analysis', { songID: songID })
    }

    //*** YOUTUBE */
    async getYoutubeList(songName, duration_ms) {
        return await makeRequest('search-yt', { songName: songName, duration_ms: duration_ms })
    }

    //*** AUDIO */
    
    // Returns path extension for the audio
    async getAudioPath(videoID) { 
        return await makeRequest('getMP3', { id: videoID })
    }
    // Returns true or false if audio finished loading
    async getAudioLoaded(videoID) {
        return await makeRequest('getLoaded', { id: videoID })
    }

}