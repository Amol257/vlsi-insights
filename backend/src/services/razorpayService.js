const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const env = require('../config/env');

// Canonical promo code dictionary (server-side single source of truth)
const PROMO_CODES = {
  'VLSI10':  { type: 'pct',  value: 10,   label: '10% off' },
  'EARLY20': { type: 'pct',  value: 20,   label: '20% off' },
  'FLAT5K':  { type: 'flat', value: 5000, label: '₹5,000 off' }
};

/**
 * Calculates subtotal, discount, tax, and final amount in rupees
 */
function calculateOrderTotals(items, promoCode) {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Math.max(1, Number(item.qty) || 1);
    return sum + (price * qty);
  }, 0);

  let discount = 0;
  if (promoCode && PROMO_CODES[promoCode.toUpperCase()]) {
    const promo = PROMO_CODES[promoCode.toUpperCase()];
    if (promo.type === 'pct') {
      discount = Math.round(subtotal * (promo.value / 100));
    } else if (promo.type === 'flat') {
      discount = Math.min(subtotal, promo.value);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  // GST @ 18%
  const tax = Math.round(taxableAmount * 0.18);
  const total = taxableAmount + tax;

  return { subtotal, discount, tax, total };
}

/**
 * Creates a Razorpay Order
 */
async function createOrder({ items, promoCode, user }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Cart cannot be empty');
  }

  const totals = calculateOrderTotals(items, promoCode);
  const amountInPaise = Math.round(totals.total * 100);

  const receipt = 'rcpt_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  const notes = {
    user_id: user ? (user.id || user.email || 'guest') : 'guest',
    items_count: items.length.toString(),
    promo_code: promoCode || 'NONE'
  };

  if (razorpay) {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      notes: notes
    };
    const order = await razorpay.orders.create(options);
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      totals: totals,
      keyId: env.RAZORPAY.KEY_ID
    };
  }

  // Simulation mode for testing / development
  const simulatedOrderId = 'order_sim_' + Date.now().toString(36);
  return {
    orderId: simulatedOrderId,
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt,
    totals: totals,
    keyId: env.RAZORPAY.KEY_ID,
    simulated: true
  };
}

/**
 * Verifies Razorpay payment signature
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId) {
    return false;
  }

  // If running in simulation mode
  if (orderId.startsWith('order_sim_') || env.RAZORPAY.KEY_SECRET === 'test_secret') {
    return true;
  }

  if (!signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY.KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');

  return generatedSignature === signature;
}

/**
 * Verifies Razorpay webhook signature
 */
function verifyWebhookSignature(payloadString, signature) {
  if (!env.RAZORPAY.WEBHOOK_SECRET) return true;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY.WEBHOOK_SECRET)
    .update(payloadString)
    .digest('hex');
  return expected === signature;
}

module.exports = {
  PROMO_CODES,
  calculateOrderTotals,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
};
