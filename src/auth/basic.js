import createHttpError from 'http-errors';
import atob from 'atob';
import AuthorModel from '../authors/schema.js';

export const basicAuthMiddleware = async (req, res, next) => {
  console.log('basic middle were');
  console.log(req.headers);
  if (!req.headers.authorization) {
    next(createHttpError(401, 'Please provide credentials'));
  } else {
    const decodedCredentials = atob(req.headers.authorization.split(' ')[1]);
    const [email, password] = decodedCredentials.split(':');
    console.log('EMAIL ', email);
    console.log('PASSWORD ', password);

    const user = await AuthorModel.checkCredentials(email, password);
    console.log(user);
    if (user) {
      req.user = user;
      next();
    } else {
      next(createHttpError(401, 'Credentials are not correct'));
    }
  }
};
