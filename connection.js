// const e = require('cors');
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://parssa:mixbotparssa123@mixbotmain.tgrnx.mongodb.net/mixbotdb?retryWrites=true&w=majority";

const REFERENCE = "songrefs";
const WHITELIST = "songref-whitelist";
const ANALYSIS = "song-analysis";

async function databaseCheck(client, trackID, collectionID) {
    console.log(">>> (DB-CHECK) checking for entry", trackID);

    const database = client.db("mixbotdb");
    const collection = database.collection(collectionID);

    const query = { songID: trackID };
    const result = await collection.findOne(query);
    
    // console.log(">>> (DB-" + collectionID, "CHECK): got result", result);
    return result;
}

async function addToDatabase(client, newEntry, collectionID) {
    console.log(">>> (DB-CREATE): going to create new entry in", collectionID);
    console.log(">>> (DB-CREATE): first checking if already in collection");
    const properObj = JSON.parse(newEntry);
    console.log(">>> (DB-CREATE): before we check, the songID is:", properObj.songID);
    const alreadyInCollection = await databaseCheck(client, properObj.songID, collectionID);

    if (alreadyInCollection === null) {
        console.log(">>> (DB-CREATE): WAS NOT IN DB YET!");

        const collection = client.db("mixbotdb").collection(collectionID);
        const result = await collection.insertOne(properObj);

        console.log(">>> (DB): added new entry:", properObj);
        console.log(`${result.insertedCount} documents were inserted with _id: ${result.insertedId} in ${collectionID}`);
    } else {
        console.log(`>>> (!!DB-CREATE): Failed to add ${properObj.songID} to database, alreadyInCollection yieleded: ${alreadyInCollection}`);
    }
}

//** SONG REF DATABASE */

//* Checks if track is in song reference collection
const refCheck = async function (checkID) {
    console.log(">>> (DB-SONGREFERENCE  CHECK) (1): checking for entry", checkID);
    let result = null;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        result = await databaseCheck(client, checkID, REFERENCE);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}
//* Adds track to the song reference collection
const refAdd = async function (entry) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        await addToDatabase(client, entry, REFERENCE);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//** TRACK ANALYSIS DATABASE */

//* Checks if track by {checkID (spotify id)} is in analysis collection
const analysisCheck = async function (checkID) {
    console.log(">>> (DB-ANALYSIS  CHECK) (1): checking for entry", checkID);
    let result = null;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        result = await databaseCheck(client, checkID, ANALYSIS);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}
//* Add song analysis to the collection
const analysisAdd = async function (entry) {
    console.log(">>> (DB-ANALYSIS  CREATE) (1): creating new analysis entry for ID", entry.songID);
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        await addToDatabase(client, entry, ANALYSIS);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
//* Add song to the whitelist collection
const whitelistAdd = async function (entry) {
    console.log(">>> (DB-WHITELIST  CREATE) (1): creating new analysis entry for ID", entry);
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        await addToDatabase(client, entry, WHITELIST);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
//* Checks if track by {checkID (spotify id)} is in whitelist collection
const whitelistCheck = async function (checkID) {
    console.log(">>> (DB-WHITELIST  CHECK) (1): checking for entry", checkID);
    let result = null;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        result = await databaseCheck(client, checkID, WHITELIST);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}

//* Check version of app
const checkUpdate = async function () {
    console.log(">>> (DB-UPDATE): getting latest version");
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();

        const database = client.db("mixbotdb");
        const collection = database.collection("app-version");

        const query = { latest: true };
        const result = await collection.findOne(query);
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

module.exports = {
    addReference: refAdd,
    checkReference: refCheck,

    addAnalysis: analysisAdd,
    checkAnalysis: analysisCheck,

    addWhitelist: whitelistAdd,
    checkWhitelist: whitelistCheck,

    checkUpdate: checkUpdate,
}