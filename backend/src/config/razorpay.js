const Razorpay = require('razorpay');
const env = require('./env');

let razorpayInstance = null;

try {
  if (env.RAZORPAY.KEY_ID && env.RAZORPAY.KEY_SECRET && env.RAZORPAY.KEY_ID !== 'rzp_test_YourKeyHere') {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY.KEY_ID,
      key_secret: env.RAZORPAY.KEY_SECRET
    });
    console.log('[Razorpay] Initialized with Key ID:', env.RAZORPAY.KEY_ID);
  } else {
    console.warn('[Razorpay] Running in simulation/mock mode (placeholder credentials detected)');
  }
} catch (err) {
  console.error('[Razorpay] Initialization error:', err.message);
}

module.exports = razorpayInstance;
