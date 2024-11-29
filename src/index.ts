import express, { Request, Response } from 'express';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
require('dotenv').config();

const app = express();

// Use a default value with process.env.PORT
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(express.json());

// MongoDB client initialization
const client = new MongoClient(process.env.NEXT_PUBLIC_MONGODB_URL as string, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Define types for collections
interface User {
  _id : string;
  name : string;
  email : string;
  phone : string;
  roll : string;
  department : string;
  batch : number;
  position : string;
  profilePictureUrl : string;
  hashedPassword : string;
}

interface Book {
  _id : string;
  title : string;
  author : string;
  publisher : string;
  isbn : string;
  edition : string;
  category : string;
  language : string;
  totalCopies : number;
  availableCopies : number;
  publicationYear : number;
  bookCoverUrl : string;
  description : string;
}


async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("MongoDB connected successfully!");

    const database = client.db("library-project");
    const usersCollection = database.collection<User>("users");
    const booksCollection = database.collection<Book>("BookList");

    app.get('/users', async (req: Request, res: Response) => {
      try {
        const users = await usersCollection.find().toArray();
        res.json(users);
      } catch (err) {
        res.status(500).send("Error fetching users");
      }
    });

    
    app.patch('/user/:id', async (req: Request, res: Response): Promise<Response> => {
      const userId = req.params.id;
      const updatedUser = req.body.updatedUser;
    
      if (!ObjectId.isValid(userId)) {
        return res.status(400).send("Invalid user ID");
      }
    
      try {
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: updatedUser }
        );
    
        if (result.modifiedCount === 0) {
          return res.status(404).send("User not found or no changes made");
        }
    
        return res.json({ message: "User updated successfully", result });
      } catch (err) {
        console.error("Error updating user:", err);
        return res.status(500).send("Error updating user");
      }
    });
    


    app.get('/book', async (req: Request, res: Response) => {
      try {
        const books = await booksCollection.find().toArray();
        res.json(books);
      } catch (err) {
        res.status(500).send("Error fetching books");
      }
    });

    app.post('/book', async (req: Request, res: Response) => {
      const book = req.body;
      try {
        const result = await booksCollection.insertOne(book);
        res.json(result);
      } catch (err) {
        res.status(500).send("Error inserting book");
      }
    });

  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

// Run the server
run().catch(console.dir);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});