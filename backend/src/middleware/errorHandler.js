const env = require('../config/env');

/**
 * Centralized error handler
 */
function errorHandler(err, req, res, next) {
  console.error('[API Error]', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const response = {
    success: false,
    error: err.message || 'Internal Server Error'
  };

  if (env.EXPOSE_STACK_TRACE === true) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
