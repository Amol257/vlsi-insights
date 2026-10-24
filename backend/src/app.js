const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const paymentRoutes = require('./routes/paymentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');

const app = express();

// Performance Gzip / Brotli Payload Compression (Checklist 3 & 6)
app.use(compression());

// Security & Logging
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = env.FRONTEND_URL || [];
    // Exact match only
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow localhost only in development
    if (env.NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    // Reject all other origins
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Preserve raw request buffer for cryptographically secure webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'VLSI Insights Backend API',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enrollment', enrollmentRoutes);

// Catch 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
