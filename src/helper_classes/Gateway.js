import axios from 'axios';

const addWhitelistURL = 'http://localhost:8080/addWhitelist';
const checkReferenceURL = 'http://localhost:8080/checkReference';
const checkWhitelistURL = 'http://localhost:8080/checkWhitelist';

export class Gateway {

    async addToWhitelist(whitelistObj) { // TODO MOVE THIS INTO IT'S OWN CLASS
        console.log("ADDING TO WHITELIST>>>", whitelistObj);
        await axios.get(addWhitelistURL, {
            params:
            {
                data: whitelistObj
            }
        });
    }

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
}