import express, { Request, Response } from 'express';
import { Collection, MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
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
  _id : ObjectId;
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

    
    app.patch('/user/:id', async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id;
      // Validate userId
      if (!ObjectId.isValid(userId)) {
        res.status(400).send("Invalid user ID");
        return;
      }
      const updatedUser = req.body;
      try {
        // Simulate a database update operation
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: updatedUser }
        );
    
        if (result.modifiedCount === 0) {
          res.status(404).send("User not found or no changes made");
          return;
        }
    
        res.status(200).json({ message: "User updated successfully", result });
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal server error");
      }
    });

    app.delete('/user/:id', async(req: Request, res: Response) => {
      const userId = req.params.id;
      // Validate userId
      if (!ObjectId.isValid(userId)) {
        res.status(400).send("Invalid user ID");
        return;
      }
      try {
        // Simulate a database deletion operation
        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
        if (result.deletedCount === 0) {
          res.status(404).send("User not found");
          return;
        }
        res.status(200).json({ message: "User deleted successfully" });
        return;
      } catch (error: any) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal server error");
      }  
    })
    


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

    app.patch('/book/:id', async (req: Request, res: Response): Promise<void> => {
      const bookId = req.params.id;
      // Validate bookId
      if (!ObjectId.isValid(bookId)) {
        res.status(400).send("Invalid book ID");
        return;
      }
      const updateBookList = req.body;
      try {
        // Simulate a database update operation
        const result = await booksCollection.updateOne(
          { _id: new ObjectId(bookId) },
          { $set: updateBookList }
        );
    
        if (result.modifiedCount === 0) {
          res.status(404).send("Book not found or no changes made");
          return;
        }
    
        res.status(200).json({ message: "book updated successfully", result });
      } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).send("Internal server error");
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