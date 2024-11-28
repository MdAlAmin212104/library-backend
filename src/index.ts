import express, { Request, Response } from 'express';
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()


const app = express();

// Use a default value with process.env.PORT
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const database = client.db("library-project");
    const usersCollection =  database.collection("users");

    app.get('/users', async (req: Request, res : Response) => {
      const users = await usersCollection.find().toArray();
      res.json(users);
    })





    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});




const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.ythezyh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


