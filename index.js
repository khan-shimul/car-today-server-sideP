const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je3vw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function server() {
    try {
        await client.connect();

        const database = client.db('car_today');
        const carsCollection = database.collection('cars');

        // find cars get api
        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);

        })

        // cars post api
        app.post('/cars', async (req, res) => {
            const cars = req.body.data;
            const result = await carsCollection.insertOne(cars);
            res.json(result);
        });
    }
    finally {
        // await client.close();
    }

}

server().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Car today server');
});

app.listen(port, () => {
    console.log('listening to port at', port)
});