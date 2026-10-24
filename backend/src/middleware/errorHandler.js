const env = require('../config/env');

/**
 * Centralized error handler
 */
function errorHandler(err, req, res, next) {
  console.error('[API Error]', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const isDev = env.NODE_ENV === 'development';
  
  const response = {
    success: false,
    error: isDev ? (err.message || 'Internal Server Error') : (statusCode >= 500 ? 'Internal Server Error' : err.message)
  };

  if (isDev) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
