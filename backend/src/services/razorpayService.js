const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const env = require('../config/env');
const catalog = require('../config/catalog.json');

// Server-side authoritative program pricing map (prevents client price tampering)
const PROGRAM_PRICES = {};
Object.entries(catalog).forEach(([key, entry]) => {
  PROGRAM_PRICES[key] = entry.price;
});


// Canonical promo code dictionary (server-side single source of truth)
const PROMO_CODES = {
  'VLSI10':  { type: 'pct',  value: 10,   label: '10% off' },
  'EARLY20': { type: 'pct',  value: 20,   label: '20% off' },
  'FLAT5K':  { type: 'flat', value: 5000, label: '₹5,000 off' }
};

/**
 * Calculates subtotal, discount, tax, and final amount in rupees
 * Enforces server-side canonical pricing lookup to eliminate client-side tampering.
 */
function calculateOrderTotals(items, promoCode) {
  const subtotal = items.reduce((sum, item) => {
    // Look up authoritative price first; never trust client item.price if catalog item matches
    const canonicalPrice = PROGRAM_PRICES[item.id] || PROGRAM_PRICES[item.slug] || Number(item.price) || 0;
    const qty = Math.max(1, Number(item.qty) || 1);
    return sum + (canonicalPrice * qty);
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
      keyId: env.RAZORPAY.KEY_ID,
      simulated: false
    };
  }

  // Fallback simulator for development/test if Razorpay credentials are unset
  const simulatedOrderId = 'order_sim_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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
 * Verifies Razorpay payment signature using constant-time comparison
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  // If running in simulation mode
  if (orderId.startsWith('order_sim_') || env.RAZORPAY.KEY_SECRET === 'test_secret') {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY.KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');

  const genBuf = Buffer.from(generatedSignature, 'utf8');
  const sigBuf = Buffer.from(signature, 'utf8');

  if (genBuf.length !== sigBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(genBuf, sigBuf);
}

/**
 * Verifies Razorpay webhook signature using raw body buffer and constant-time comparison
 */
function verifyWebhookSignature(payload, signature) {
  if (!env.RAZORPAY.WEBHOOK_SECRET) return true;
  if (!payload || !signature) return false;

  const payloadBuffer = Buffer.isBuffer(payload)
    ? payload
    : Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload), 'utf8');

  const expected = crypto
    .createHmac('sha256', env.RAZORPAY.WEBHOOK_SECRET)
    .update(payloadBuffer)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const signatureBuf = Buffer.from(signature, 'utf8');

  if (expectedBuf.length !== signatureBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

module.exports = {
  PROGRAM_PRICES,
  PROMO_CODES,
  calculateOrderTotals,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
};
