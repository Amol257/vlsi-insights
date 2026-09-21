const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.PORT, () => {
  console.log(`====================================================`);
  console.log(` VLSI Insights Backend API running on port ${env.PORT}`);
  console.log(` Health check available at: http://localhost:${env.PORT}/api/health`);
  console.log(` Environment: ${env.NODE_ENV}`);
  console.log(`====================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close();
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    process.exit(0);
  });
});
