const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.PORT, () => {
  console.info(`VLSI Insights Backend API running on port ${env.PORT}`);
  console.info(`Health check available at: http://localhost:${env.PORT}/api/health`);
  console.info(`Environment: ${env.NODE_ENV}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.info('HTTP server closed');
    process.exit(0);
  });
});
