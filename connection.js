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

const checkTrackDatabase = async function (checkID) {
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

const checkTrackAnalysisDatabase = async function (checkID) {
    let result = null;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        result = await checkEntryAnalysis(client, checkID); // todo fix
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}

const addTrackToDatabase = async function (entry) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        createTrackAnalysisEntry(client, entry);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

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
    const database = client.db("mixbotdb");
    const collection = database.collection("songrefs");
    const properObj = JSON.parse(newEntry);
    const result = await collection.insertOne(properObj);

    console.log(">>> (DB): added new entry:", newEntry);
    console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
}

async function createTrackAnalysisEntry(client, newEntry) {
    console.log(">>> (DB): creating new analysis entry", newEntry);
    // const result = await client.db()
    // await client.db()
}

async function checkEntry(client, trackID) {
    console.log(">>> (DB): checking for entry", trackID);
    const collection = client.db("mixbotdb").collection("songrefs");
    const result = await collection.findOne({ songID: trackID });
    return result;
}

async function checkEntryAnalysis(client, trackID) {
    console.log(">>> (DB): checking for entry", trackID);
    const collection = client.db("mixbotdb").collection("songdata");
    const result = await collection.findOne({ songID: trackID });
    return result;
}


module.exports = {
    addTrackRefDB: addTrackRefToDatabase,
    addTrackAnalysisDB: addTrackToDatabase,
    checkTrackDB: checkTrackDatabase,
    checkTrackAnalysisDB: checkTrackAnalysisDatabase,
}