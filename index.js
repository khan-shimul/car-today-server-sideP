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
        const ordersCollection = database.collection('orders');

        // cars get api
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

        // find single car
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const car = await carsCollection.findOne(query);
            res.send(car);
        });

        // orders post api
        app.post('/orders', async (req, res) => {
            const order = req.body.data;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })
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