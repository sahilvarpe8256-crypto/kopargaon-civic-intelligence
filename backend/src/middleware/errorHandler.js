const logger = require('../utils/logger');

/**
 * 404 Not Found Handler for unmatched routes.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
};

/**
 * Centralized Global Error Handler.
 * Ensures stack traces and raw internals are NEVER exposed to clients.
 */
const errorHandler = (err, req, res, next) => {
  // Determine appropriate status code
  let statusCode = err.statusCode || err.status;
  if (!statusCode || statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  // Handle CORS-specific rejection
  if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
  }

  // Log full error details securely on server side
  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${err.message || 'Unknown Error'}`);
  if (err.stack) {
    logger.error(`Stack: ${err.stack}`);
  }

  // Construct client response without any stack traces or internal paths
  const isInternalError = statusCode === 500;
  const errorResponse = {
    success: false,
    error: {
      code: isInternalError ? 'INTERNAL_ERROR' : (err.code || 'ERROR'),
      message: isInternalError ? 'Internal Server Error' : (err.message || 'An error occurred')
    }
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = {
  notFoundHandler,
  errorHandler
};