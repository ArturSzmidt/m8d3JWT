import express from 'express';

import cors from 'cors';

import listEndpoints from 'express-list-endpoints';

import authorsRouter from './authors/index.js';

import blogsRouter from './blogs/index.js';

import { errorHandler } from './errorHandlers.js';

import path, { dirname } from 'path';

import { fileURLToPath } from 'url';

import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const publicDirectory = path.join(__dirname, '../public');

const server = express();

const { PORT, MONGO_CONNECTION_STRING } = process.env;

server.use(cors());

server.use(express.json());

server.use(express.static(publicDirectory));

server.use('/authors', authorsRouter);

server.use('/blogs', blogsRouter);

server.use(errorHandler);

console.log(listEndpoints(server));

server.listen(PORT, async () => {
  try {
    await mongoose.connect(MONGO_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Server is running on ${PORT}  and connected to db`);
  } catch (error) {
    console.log('Db connection is failed ', error);
  }
});

server.on('error', (error) =>
  console.log(`❌ Server is not running due to : ${error}`)
);
