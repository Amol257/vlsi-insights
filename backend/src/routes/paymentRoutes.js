const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Create Razorpay order (supports guest and authenticated users)
router.post('/create-order', optionalAuth, paymentController.createOrderHandler);

// Cryptographically verify Razorpay payment
router.post('/verify', optionalAuth, paymentController.verifyPaymentHandler);

// Webhook endpoint
router.post('/webhook', paymentController.webhookHandler);

module.exports = router;
