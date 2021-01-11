const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://parssa:mixbotparssa123@mixbotmain.tgrnx.mongodb.net/mixbotdb?retryWrites=true&w=majority";

/**
 * Print the names of all available databases
 * @param {MongoClient} client A MongoClient that is connected to a cluster
 */
async function listDatabases(client) {
    let databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

const checkForTrackInDatabase = async function (checkID) {
    let result = false;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        await listDatabases(client);
        result = checkEntry(client, checkID);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}

const addTrackToDatabase = async function (entry) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        createTrackEntry(client, entry);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

const addTrackRefToDatabase = async function (entry) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        createTrackEntry(client, entry);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

module.exports = {
    addTrackRefDB: addTrackRefToDatabase,
    addTrackAnalysisDB: addTrackToDatabase,
    checkTrackDB: checkForTrackInDatabase
}

async function createTrackRefEntry(client, newEntry) {
    console.log(">>> (DB): creating new track reference entry", newEntry.data);
    // const result = await client.db()
    // await client.db()
}

async function createTrackEntry(client, newEntry) {
    console.log(">>> (DB): creating new analysis entry", newEntry.track);
    // const result = await client.db()
    // await client.db()
}

async function checkEntry(client, trackID) {
    console.log(">>> (DB): checking for entry", trackID);
    return true;
}

// mixbotDB({ foo: "heehee" }).catch(console.err);