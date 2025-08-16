import { env } from "../config/env.js";

export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  // Static method to create an AppError and send response (for Express.js)
  static createAndSendError(res, message, statusCode, isOperational = true) {
    const error = new AppError(message, statusCode, isOperational);
    
    // Standardized error response
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        timestamp: error.timestamp
      })
    });
  }

  // Convert error to response format (for non-Express scenarios)
  toResponse() {
    return {
      status: this.status,
      message: this.message,
      ...(env.NODE_ENV === 'development' && {
        stack: this.stack,
        timestamp: this.timestamp
      })
    };
  }
}

// Central error handling middleware for Express
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error for development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);
  }

  // Handle operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        timestamp: err.timestamp
      })
    });
  }

  // Handle programming or unknown errors
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!'
  });
};

