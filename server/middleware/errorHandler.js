const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    
    // Default status code
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Handle Mongoose Bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        err.message = 'Resource not found';
    }

    // Handle Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        err.message = 'Duplicate field value entered';
    }

    // Handle Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
        err.message = message;
    }

    res.status(statusCode).json({
        msg: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
