import express, { Request, Response } from 'express';
import { Collection, MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import cors from 'cors';
require('dotenv').config();


const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(express.json());
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

    app.get('/user/:id', async (req: Request, res: Response) => {
      const userId = req.params.id;
      // Validate userId
      if (!ObjectId.isValid(userId)) {
        res.status(400).send("Invalid user ID");
        return;
      }
      try {
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
          res.status(404).send("User not found");
          return;
        }
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Internal server error");
      }
    })

    
    app.patch('/user/:id', async (req: Request, res: Response): Promise<void> => {
      const userId = req.params.id;
      const updateData = req.body;
    
      // Validate ID
      if (!ObjectId.isValid(userId)) {
        res.status(400).send("Invalid user ID");
        return;
      }
    
      // Validate payload
      if (!updateData || Object.keys(updateData).length === 0) {
        res.status(400).send("No update data provided");
        return;
      }
    
      try {
        // Remove _id field from update payload
        const { _id, ...filteredUpdateData } = updateData;
    
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: filteredUpdateData }
        );
        if (result.matchedCount === 0) {
          res.status(404).send("User not found");
          return;
        }
    
        if (result.modifiedCount === 0) {
          res.status(200).send("No changes made to the user");
          return;
        }
    
        res.status(200).json({ message: "User updated successfully", result });
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.delete('/user/:id', async(req: Request, res: Response) => {
      const userId = req.params.id;
      // Validate bookId
      if (!ObjectId.isValid(userId)) {
        res.status(400).send("Invalid book ID");
        return;
      }
      try {
        // Simulate a database deletion operation
        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
        if (result.deletedCount === 0) {
          res.status(404).send("user not found");
          return;
        }
        res.status(200).json({ message: "user deleted successfully" });
        return;
      } catch (error: any) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal server error");
      }  
    })
    


    app.get("/books", async (req: Request, res: Response) => {
      try {
        // Parse query parameters for pagination
        const page = parseInt(req.query.page as string) || 1; // Default to page 1
        const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
        const skip = (page - 1) * limit;
    
        // Fetch paginated books
        const books = await booksCollection.find().skip(skip).limit(limit).toArray();
    
        // Fetch the total count of books
        const totalBooks = await booksCollection.countDocuments();
    
        // Send paginated response
        res.json({
          books,
          totalBooks,
          totalPages: Math.ceil(totalBooks / limit),
          currentPage: page,
        });
      } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Error fetching books" });
      }
    });

    app.get('/book/:bookId', async (req : Request, res : Response) => {
      const bookId = req.params.bookId;
      // Validate bookId
      if (!ObjectId.isValid(bookId)) {
        res.status(400).send("Invalid book ID");
        return;
      }
      try {
        const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });
        if (!book) {
          res.status(404).send("Book not found");
          return;
        }
        res.json(book);
      } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).send("Internal server error");
      }
    }
  )


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
      const updateBookList = req.body;
    
      const bookId = req.params.id;
    
      // Validate bookId
      if (!ObjectId.isValid(bookId)) {
        res.status(400).send("Invalid book ID");
        return;
      }
    
      // Remove the _id field from the update payload if it exists
      const { _id, ...updateData } = updateBookList;
    
      try {
        // Simulate a database update operation
        const result = await booksCollection.updateOne(
          { _id: new ObjectId(bookId) },
          { $set: updateData }
        );
    
        if (result.matchedCount === 0) {
          res.status(404).send("Book not found");
          return;
        }
    
        if (result.modifiedCount === 0) {
          res.status(200).send("No changes made to the book");
          return;
        }
    
        res.status(200).json({ message: "Book updated successfully", result });
      } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.delete('/book/:id', async(req: Request, res: Response) => {
      const bookId = req.params.id;
      // Validate bookId
      if (!ObjectId.isValid(bookId)) {
        res.status(400).send("Invalid book ID");
        return;
      }
      try {
        // Simulate a database deletion operation
        const result = await booksCollection.deleteOne({ _id: new ObjectId(bookId) });
        if (result.deletedCount === 0) {
          res.status(404).send("book not found");
          return;
        }
        res.status(200).json({ message: "book deleted successfully" });
        return;
      } catch (error: any) {
        console.error("Error deleting book:", error);
        res.status(500).send("Internal server error");
      }  
    })
    

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