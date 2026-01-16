/**
 * Centralized Error Handling Middleware
 * Catches all errors and formats them consistently
 */

const logger = require('../utils/logger');
const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      error: 'Validation Error',
      details: message,
      issues: err.issues,
    });
  }

  // Operational errors (from AppError)
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      error: err.message,
      status: err.status,
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(400).json({
      error: `Duplicate value for field: ${field}`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token. Please log in again.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Your token has expired. Please log in again.',
    });
  }

  // Default to 500 server error
  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
