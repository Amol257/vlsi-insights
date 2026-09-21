const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.PORT);

// Graceful Shutdown
process.on('SIGTERM', () => {
  server.close();
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});
