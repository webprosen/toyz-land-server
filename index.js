// Require package
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewire
app.use(cors());
app.use(express.json());

// MongoDB uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ww5yfzh.mongodb.net/?retryWrites=true&w=majority`;

// MongoDB client
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// All operation 
async function run() {
    try {
        // Connect the client to the server
        // await client.connect();

        // Create collection
        const toyCollection = client.db('toyz_land').collection('toys');

        // All Routes
        app.get('/', (req, res) => {
            res.send('Toyz land server is running...');
        });

        // Get all data
        app.get('/all-toys', async (req, res) => {
            const result = await toyCollection.find().limit(20).toArray();
            res.send(result);
        });

        app.get('/category-toys', async (req, res) => {
            let query = {};
            if (req.query?.search) {
                query = {'subCategory': {'$regex': req.query.search}}
            }
            const result = await toyCollection.find(query).toArray();
            res.send(result);
        });
        
        app.get('/my-toys', async (req, res) => {
            let query = {};
            const { sort } = req.query;
            const sortOrder = sort === 'asc' ? 1 : sort === 'desc' ? -1 : 0;
            if (req.query?.email) {
                query = { sellerEmail: req.query.email }
            }
            let result = null;
            if(sortOrder === 0){
                result = await toyCollection.find(query).toArray();
            }
            else {
                result = await toyCollection.find(query).sort({ price: sortOrder }).toArray();
            }
            res.send(result);
        });

        // Get single data
        app.get('/my-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        });

        // Post single data
        app.post('/add-toy', async (req, res) => {
            const toy = req.body;
            const result = await toyCollection.insertOne(toy);
            res.send(result);
        });

        // Update single data
        app.put('/my-toys/:id', async (req, res) => {
            const id = req.params.id;
            const updatedToy = req.body;
            const query = { _id: new ObjectId(id) };
            const option = { upsert: true };
            const latestToy = {
                $set: updatedToy
            }
            const result = await toyCollection.updateOne(query, latestToy, option);
            res.send(result);
        });

        // Delete single data
        app.delete('/my-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        });

        // Check database connection
        await client.db("admin").command({ ping: 1 });
        console.log("You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

// Listening
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});