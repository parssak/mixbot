import axios from 'axios';
import { Analyzer } from './Analyzer';
const baseURL = 'http://localhost:8080'
const serverBaseURL = 'https://stark-reef-17924.herokuapp.com/';

const checkUpdateURL = baseURL + '/checkUpdate';

const addWhitelistURL = baseURL + '/addWhitelist';
const checkWhitelistURL = baseURL + '/checkWhitelist';

const addAnalysisURL = baseURL + '/addAnalysis';
const checkAnalysisURL = baseURL + '/checkAnalysis';

const checkReferenceURL = baseURL +'/checkReference';
const addReferenceURL = baseURL + '/addReference';

const makeRequest = async (path, p) => {
    const res = await axios.get(serverBaseURL + path, {
        params: {
            data: p
        }
    })
    return res;
}

export class Gateway {

    async checkForUpdate(currVersion) {
        let result = null;
        result = await axios.get(checkUpdateURL, {
            params:
            {
                data: currVersion
            }
        });
        return result.data;
    }

    //*** ADDING DB*/
    async addToAnalysis(analysisObj) {
        await axios.get(addAnalysisURL, {
            params:
            {
                data: analysisObj
            }
        });
    }

    async addToWhitelist(whitelistObj) { 
        await axios.get(addWhitelistURL, {
            params:
            {
                data: whitelistObj
            }
        });
    }

    async addToReference(referenceObj) {
        await axios.get(addReferenceURL, {
            params:
            {
                data: referenceObj
            }
        });
    }
    
    //*** GETTING DB */
    async checkReferenceDB(trackID) { 
        let result = null;
        if (trackID) {
            result = await axios.get(checkReferenceURL, {
                params:
                {
                    data: trackID
                }
            });
        } else {
            console.log('dne');
        }
        if (result) return result.data;
        else return null;
        
    }

    async checkAnalysisDB(trackID) {
        let result = null;
        if (trackID) {
            result = await axios.get(checkAnalysisURL, {
                params:
                {
                    data: trackID
                }
            });
        }
        if (result) return result.data;
        else return null;
    }

    async checkWhitelistDB(trackID) { 
        let result = null;
        if (trackID) {
            result = await axios.get(checkWhitelistURL, {
                params:
                {
                    data: trackID
                }
            });
        }
        return result.data;
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
        console.log('searching for ', songName, duration_ms);
        return await makeRequest('search-yt', { songName: songName, duration_ms: duration_ms })
    }

}