const errorMiddleware = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Server Error';
    const success = false;

    console.log('Error middleware error recieved: \n',err);
    return res.status(status).json({message, success});
}

module.exports = errorMiddleware;