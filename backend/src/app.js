const express = require('express');
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

// Security & Logging
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (env.FRONTEND_URL.includes('*') || env.FRONTEND_URL.some(allowed => origin.startsWith(allowed) || allowed === origin)) {
      return callback(null, true);
    }
    // Allow localhost during dev
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for client static deploys
  },
  credentials: true
}));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
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
