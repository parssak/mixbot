const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://parssa:mixbotparssa123@mixbotmain.tgrnx.mongodb.net/mixbotdb?retryWrites=true&w=majority";

//** SONG REF DATABASE */

//* Checks if track by {checkID (spotify id)} is in song reference database
const checkTrackDatabase = async function (checkID) {
    console.log(">>> (DB-SONGREFERENCE  CHECK) (1): checking for entry", checkID);
    let result = null;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        result = await checkEntry(client, checkID);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}
async function checkEntry(client, trackID) {
    console.log(">>> (DB-SONGREFERENCE  CHECK) (2): checking for entry", trackID);

    const database = client.db("mixbotdb");
    const collection = database.collection("songrefs");

    const query = { songID: trackID };
    const result = await collection.findOne(query);
    console.log(">>> (DB-SONGREFERENCE  CHECK): got result", result);
    return result;
}

//* Adds track to the song reference database
const addTrackRefToDatabase = async function (entry) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        await createTrackRefEntry(client, entry);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function createTrackRefEntry(client, newEntry) {
    console.log(">>> (DB): creating new track reference entry", newEntry);
    const collection = client.db("mixbotdb").collection("songrefs");
    const properObj = JSON.parse(newEntry);
    const result = await collection.insertOne(properObj);

    console.log(">>> (DB): added new entry:", newEntry);
    console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
}

//** TRACK ANALYSIS DATABASE */

//* Checks if track by {checkID (spotify id)} is in analysis database
const checkTrackAnalysisDatabase = async function (checkID) {
    console.log(">>> (DB-ANALYSIS  CHECK) (1): checking for entry", checkID);
    let result = null;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        result = await checkEntryAnalysis(client, checkID); 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}
async function checkEntryAnalysis(client, trackID) {
    console.log(">>> (DB-ANALYSIS  CHECK) (2): checking for entry", trackID);
    const collection = client.db("mixbotdb").collection("songdata");
    const result = await collection.findOne({ songID: trackID });
    return result;
}

//* Add song analysis to the database
const addTrackAnalysisDatabase = async function (entry) {
    console.log(">>> (DB-ANALYSIS  CREATE) (1): creating new analysis entry", entry);
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        await createTrackAnalysisEntry(client, entry);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
async function createTrackAnalysisEntry(client, newEntry) {
    console.log(">>> (DB-ANALYSIS  CREATE) (2): creating new analysis entry", newEntry);
    const alreadyIn = await checkEntryAnalysis(client, newEntry.songID);
    console.log("ALREADY IN VAR >>>>>>>>>> " + alreadyIn);

    const database = client.db("mixbotdb");
    const collection = database.collection("songdata");
    const properObj = JSON.parse(newEntry);
    const result = await collection.insertOne(properObj);
    console.log(">>> (DB): added new entry:");
    console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
}



const addWhitelistToDatabase = async function (entry) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        await createWhitelistEntry(client, entry);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}


async function createWhitelistEntry(client, newEntry) {
    console.log(">>> (DB): creating new whitelist entry", newEntry);
    const collection = client.db("mixbotdb").collection("notfoundref");
    const properObj = JSON.parse(newEntry);
    const result = await collection.insertOne(properObj);
    console.log(">>> (DB): added new entry:", properObj);
    console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
}


module.exports = {
    addTrackRefDB: addTrackRefToDatabase,
    addTrackAnalysisDB: addTrackAnalysisDatabase,
    addWhitelistTrackDB: addWhitelistToDatabase,
    checkTrackDB: checkTrackDatabase,
    checkTrackAnalysisDB: checkTrackAnalysisDatabase,
}