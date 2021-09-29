export const errorHandler = (err, req, res, next) => {
  err
    ? console.log(err)
    : res.status(500).send({ message: 'Something went wrong!' });
};
