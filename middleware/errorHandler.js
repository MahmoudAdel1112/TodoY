const AppError = require('../classes/AppError');

// Handle Mongoose cast errors (invalid ObjectId)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle Mongoose duplicate field errors
const handleDuplicateFieldsDB = (err) => {
  let message = 'Duplicate field value. Please use another value!';
  
  // Handle different MongoDB error formats
  if (err.keyValue) {
    // New MongoDB format (v4.2+)
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `Duplicate field value: ${field} = ${value}. Please use another value!`;
  } else if (err.errmsg) {
    // Old MongoDB format
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
    if (match) {
      message = `Duplicate field value: ${match[0]}. Please use another value!`;
    }
  }
  
  return new AppError(message, 400);
};

// Handle Mongoose validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error with request details
  const logMessage = `[${new Date().toISOString()}] ${err.statusCode} ${req.method} ${req.originalUrl} - ${err.message}`;
  
  if (err.statusCode >= 500) {
    console.error('🔴 SERVER ERROR:', logMessage);
    console.error('Stack:', err.stack);
    if (process.env.NODE_ENV === 'development') {
      console.error('Request body:', req.body);
    }
  } else if (err.statusCode >= 400) {
    console.error('🟡 CLIENT ERROR:', logMessage);
    if (process.env.NODE_ENV === 'development') {
      console.error('Request body:', req.body);
    }
  }

  // Handle different error types
  if (err.name === 'CastError') err = handleCastErrorDB(err);
  if (err.code === 11000) err = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

module.exports = globalErrorHandler;
