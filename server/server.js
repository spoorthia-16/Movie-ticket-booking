import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import dns from "dns";
const app = express();
const port = 3000;

dns.setServers(["8.8.8.8", "8.8.4.4"]);

try {
  await connectDB()
} catch (error) {
  console.error('Failed to connect to database:', error);
  process.exit(1);
}

//Middleware
app.use(express.json())
app.use(clerkMiddleware())
app.use(cors())

//API route
app.get('/',(req,res)=> res.send('Server is live!'))
app.use('/api/inngest',serve({ client: inngest, functions }))

app.listen(port,()=> console.log(`Server listening at http://localhost:${port}`));