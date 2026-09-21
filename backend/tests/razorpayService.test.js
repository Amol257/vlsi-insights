const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const razorpayService = require('../src/services/razorpayService');
const env = require('../src/config/env');

test('verifyPaymentSignature - valid signature should return true', () => {
  const orderId = 'order_12345';
  const paymentId = 'pay_67890';
  const validSignature = crypto
    .createHmac('sha256', env.RAZORPAY.KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');

  const isValid = razorpayService.verifyPaymentSignature({
    orderId,
    paymentId,
    signature: validSignature
  });

  assert.strictEqual(isValid, true);
});

test('verifyPaymentSignature - invalid signature should return false', () => {
  const orderId = 'order_12345';
  const paymentId = 'pay_67890';
  const invalidSignature = 'invalid_signature_hash_value';

  const isValid = razorpayService.verifyPaymentSignature({
    orderId,
    paymentId,
    signature: invalidSignature
  });

  assert.strictEqual(isValid, false);
});

test('verifyPaymentSignature - missing params should return false', () => {
  assert.strictEqual(razorpayService.verifyPaymentSignature({ orderId: 'order_1', paymentId: 'pay_1' }), false);
  assert.strictEqual(razorpayService.verifyPaymentSignature({ orderId: 'order_1', signature: 'sig' }), false);
  assert.strictEqual(razorpayService.verifyPaymentSignature({ paymentId: 'pay_1', signature: 'sig' }), false);
});

test('verifyPaymentSignature - simulated order ID without valid signature should return false (no bypass)', () => {
  const orderId = 'order_sim_12345';
  const paymentId = 'pay_67890';

  // Attempting bypass with arbitrary or missing signature
  const isValidWithoutSig = razorpayService.verifyPaymentSignature({
    orderId,
    paymentId
  });

  const isValidWithFakeSig = razorpayService.verifyPaymentSignature({
    orderId,
    paymentId,
    signature: 'fake_signature'
  });

  assert.strictEqual(isValidWithoutSig, false);
  assert.strictEqual(isValidWithFakeSig, false);
});
