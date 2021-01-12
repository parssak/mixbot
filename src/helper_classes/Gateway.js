import axios from 'axios';

const baseURL = 'http://localhost:8080'

const addWhitelistURL = baseURL + '/addWhitelist';
const checkWhitelistURL = baseURL + '/checkWhitelist';

const addAnalysisURL = baseURL + '/addAnalysis';
const checkAnalysisURL = baseURL + '/checkAnalysis';

const checkReferenceURL = baseURL +'/checkReference';
const addReferenceURL = baseURL + '/addReference';

export class Gateway {

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
        }
        return result.data;
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
        return result.data;
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
    async getSpotifyAnalysis(trackID, token) {
        let result = null;
        if (trackID) {
            result = await axios(`https://api.spotify.com/v1/audio-analysis/${trackID}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
        }
        return result;
    }

    //*** YOUTUBE */

}