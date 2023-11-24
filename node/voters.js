// voter microservice
const express = require("express");
const app = express();

const {MongoClient} = require("mongodb");
const uri = "mongodb://mongodb:27017";
const client = new MongoClient(uri);

const hostname = "0.0.0.0";
let port = 3002;

app.use(express.json());

app.listen(port, () => `server running at http://${hostname}:${port}`);

// Create
app.post('/', async (request, response) => {
    const submittedVoterName = request.body.name;
    const voterData = {"name": submittedVoterName, "ballot": null};
    try {
        await client.connect();
        await client.db('voting').collection('voters').insertOne(voterData).then(results => response.send(results));
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
})

// GET
app.get("/", async (request, response) => {
    // load voter data - READ
    try {
        await client.connect();
        await client.db("voting").collection("voters").find().toArray().then(results => response.send(results));
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
});

// PUT
app.put("/", async (request, response) => {
    const candidate = request.body.candidate;
    const voterFilter = {name: request.body.voter};
    const updateDocument = {$set: {"ballot": {"candidate": candidate}}};
    try {
        await client.connect();
        await client
            .db("voting")
            .collection("voters")
            .updateOne(voterFilter, updateDocument)
            .then((results) => response.send(results))
            .catch((error) => console.error(error));
    } finally {
        await client.close();
    }
});

// Delete
app.delete("/", async (request, response) => {
    const voterFilter = {"name": request.body.name};
    try {
        await client.connect();
        const results = await client.db("voting").collection("voters").deleteOne(voterFilter);
        await response.send(results);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
});
