import createHttpError from 'http-errors';
import { verifyJWT } from './tools.js';
import AuthorsModel from '../authors/schema.js';

export const JWTAuthMiddleware = async (req, res, next) => {
  // 1. Check if Authorization header is received, if it is not --> trigger an error (401)

  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        'Please provide credentials in Authorization header!'
      )
    );
  } else {
    try {
      // 2. Extract the token from the Authorization header (authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTUyZjMzNzdhNWVlYmRlMDhkZThhZjkiLCJpYXQiOjE2MzI5MDU3MTN9.FL17SFz1zSGXbMnsLNxbFrnlgCxU8-FtaTnxbiQr-XM)

      const token = req.headers.authorization.replace('Bearer ', '');

      // 3. Verify token, if it goes fine we'll get back the payload ({_id: "oijoij12i3oj23"}), otherwise an error is being thrown by the jwt library
      const decodedToken = await verifyJWT(token);
      console.log(decodedToken);

      // 4. Find the user in db by id and attach him to req.user
      const user = await AuthorsModel.findById(decodedToken._id);

      if (user) {
        req.user = user;
        next();
      } else {
        next(createHttpError(404, 'User not found!'));
      }
    } catch (error) {
      next(createHttpError(401, 'Token not valid!'));
    }
  }
};
