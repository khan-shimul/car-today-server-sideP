const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const ObjectId = require('mongodb').ObjectId;
const admin = require("firebase-admin");
require('dotenv').config()

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// const serviceAccount = require('./car-today-firebase-adminsdk.json');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je3vw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// verify firebase idToken
// async function verifyToken(req, res, next) {
//     if (req.headers?.authorization?.startsWith('Bearer ')) {
//         const token = req.headers.authorization.split('Bearer ')[1];

//         try {
//             const decodeUser = await admin.auth().verifyIdToken(token);
//             req.decodeEmail = decodeUser.email;
//         }
//         catch {

//         }
//     }

//     next();
// }


async function server() {
    try {
        await client.connect();

        const database = client.db('car_today');
        const carsCollection = database.collection('cars');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

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

        // cars delete api
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.deleteOne(query);
            res.json(result);
        })

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
        });

        // orders get api
        app.get('/all-orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // order status update api
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { status: 'Shipped' }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // find order using query get api
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });

        // order delete api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        // reviews post api
        app.post('/reviews', async (req, res) => {
            const review = req.body.data;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        // get reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        });

        // post users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // check admin role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // put users api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // make admin role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // const requesterEmail = req.decodeEmail;
            // if (requesterEmail) {
            //     const requesterAccount = await usersCollection.findOne({ email: requesterEmail });
            //     if (requesterAccount.role === 'admin') {

            //     }
            // }
            // else {
            //     res.status(403).json({ error: 'Your dont have access' })
            // }
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
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