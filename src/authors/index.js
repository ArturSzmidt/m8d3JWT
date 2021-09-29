import express from 'express';

import fs, { access } from 'fs';

import uniqid from 'uniqid';

import path, { dirname } from 'path';

import { fileURLToPath } from 'url';

import { parseFile } from '../utils/upload/index.js';

import Authors from './schema.js';

import { generateCSV } from '../utils/csv/index.js';
import { basicAuthMiddleware } from '../auth/basic.js';
import { JWTAuthenticate } from '../auth/tools.js';
import createHttpError from 'http-errors';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const authorsFilePath = path.join(__dirname, 'authors.json');

const router = express.Router();

// get all authors
router.get('/', async (req, res, next) => {
  try {
    const authors = await Authors.find({});
    res.send(authors);
  } catch (error) {
    res.send(500).send({ message: error.message });
    console.log(error);
  }
});

// // get all authors export as csv
// router.get("/csv", async (req, res, next) => {
//   try {
//     const fileAsBuffer = fs.readFileSync(authorsFilePath);
//     const fileAsString = fileAsBuffer.toString();
//     const fileAsJSON = JSON.parse(fileAsString);
//     if (fileAsJSON.length > 0) {
//       const [first, ...rest] = fileAsJSON;
//       const fields = Object.keys(first);
//       const csvBuffer = generateCSV(fields, fileAsJSON);
//       res.setHeader("Content-Type", "text/csv");
//       res.setHeader(
//         "Content-Disposition",
//         'attachment; filename="authors.csv"'
//       );
//       res.send(csvBuffer);
//     } else {
//       res.status(404).send({ message: "there is no one here." });
//     }
//   } catch (error) {
//     res.send(500).send({ message: error.message });
//   }
// });

// create  author
router.post('/register', async (req, res, next) => {
  try {
    const author = await new Authors(req.body).save();
    res.send(author);
  } catch (error) {
    console.log({ error });
    res.send(500).send({ message: error.message });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await Authors.checkCredentials(email, password);

    if (author) {
      const { accessToken, refreshToken } = await JWTAuthenticate(author);
      res.send({ accessToken, refreshToken });
    } else {
      next(createHttpError(401, 'credentials are not correct!'));
    }
  } catch (error) {
    next(error);
  }
});

// get single authors
// router.get('/:id', async (req, res, next) => {
//   try {
//     const author = await Authors.findById(req.params.id);
//     if (!author) {
//       res
//         .status(404)
//         .send({ message: `Author with ${req.params.id} is not found!` });
//     } else res.send(author);
//   } catch (error) {
//     res.send(500).send({ message: error.message });
//   }
// });
router.get('/me', basicAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
    console.log(error, 'error in me get');
  }
});

// delete  author
router.delete('/:id', async (req, res, next) => {
  try {
    const author = Authors.findById(req.params.id);
    if (!author) {
      res
        .status(404)
        .send({ message: `Author with ${req.params.id} is not found!` });
    }
    await Authors.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

//  update author
router.put('/:id', async (req, res, next) => {
  try {
    const changedAuthor = await Authors.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.send(changedAuthor);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// router.put(
//   "/:id/avatar",
//   parseFile.single("avatar"),
//   async (req, res, next) => {
//     try {
//       const fileAsBuffer = fs.readFileSync(authorsFilePath);

//       const fileAsString = fileAsBuffer.toString();

//       let fileAsJSONArray = JSON.parse(fileAsString);

//       const authorIndex = fileAsJSONArray.findIndex(
//         (author) => author.id === req.params.id
//       );
//       if (!authorIndex == -1) {
//         res
//           .status(404)
//           .send({ message: `Author with ${req.params.id} is not found!` });
//       }
//       const previousAuthorData = fileAsJSONArray[authorIndex];
//       const changedAuthor = {
//         ...previousAuthorData,
//         avatar: req.file.path,
//         updatedAt: new Date(),
//         id: req.params.id,
//       };
//       fileAsJSONArray[authorIndex] = changedAuthor;
//       fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));
//       res.send(changedAuthor);
//     } catch (error) {
//       res.send(500).send({ message: error.message });
//     }
//   }
// );

export default router;
