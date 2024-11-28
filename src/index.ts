import express, { Request, Response } from 'express';

const app = express();

// Use a default value with process.env.PORT
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
