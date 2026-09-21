const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const razorpayService = require('../src/services/razorpayService');
const supabaseService = require('../src/services/supabaseService');
const { verifyPaymentHandler } = require('../src/controllers/paymentController');

// Helper to create mock response object
function createMockRes() {
  const res = {};
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(data) {
    res.body = data;
    return res;
  };
  return res;
}

describe('verifyPaymentHandler', () => {
  let originalVerifySignature;
  let originalUpdateOrderStatusPaid;

  beforeEach(() => {
    originalVerifySignature = razorpayService.verifyPaymentSignature;
    originalUpdateOrderStatusPaid = supabaseService.updateOrderStatusPaid;
  });

  afterEach(() => {
    razorpayService.verifyPaymentSignature = originalVerifySignature;
    supabaseService.updateOrderStatusPaid = originalUpdateOrderStatusPaid;
  });

  test('returns 400 if orderId or paymentId is missing', async () => {
    const req = {
      body: {
        orderId: 'order_123'
        // paymentId is missing
      }
    };
    const res = createMockRes();
    let nextCalled = false;
    const next = (err) => { nextCalled = true; };

    await verifyPaymentHandler(req, res, next);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'orderId and paymentId are required');
    assert.strictEqual(nextCalled, false);
  });

  test('returns 400 if payment signature verification fails', async () => {
    razorpayService.verifyPaymentSignature = () => false;

    const req = {
      body: {
        orderId: 'order_123',
        paymentId: 'pay_123',
        signature: 'invalid_signature'
      }
    };
    const res = createMockRes();
    let nextCalled = false;
    const next = (err) => { nextCalled = true; };

    await verifyPaymentHandler(req, res, next);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'Cryptographic payment verification failed');
    assert.strictEqual(nextCalled, false);
  });

  test('returns 200 and updates order status when verification succeeds', async () => {
    let signatureVerifiedArgs = null;
    let updateStatusArgs = null;

    razorpayService.verifyPaymentSignature = (args) => {
      signatureVerifiedArgs = args;
      return true;
    };

    supabaseService.updateOrderStatusPaid = async (args) => {
      updateStatusArgs = args;
      return { id: 'order_123' };
    };

    const req = {
      body: {
        orderId: 'order_123',
        paymentId: 'pay_123',
        signature: 'valid_signature'
      }
    };
    const res = createMockRes();
    let nextCalled = false;
    const next = (err) => { nextCalled = true; };

    await verifyPaymentHandler(req, res, next);

    assert.deepStrictEqual(signatureVerifiedArgs, {
      orderId: 'order_123',
      paymentId: 'pay_123',
      signature: 'valid_signature'
    });
    assert.deepStrictEqual(updateStatusArgs, {
      orderId: 'order_123',
      paymentId: 'pay_123',
      signature: 'valid_signature'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, 'Payment verified and enrollment confirmed');
    assert.strictEqual(res.body.data.orderId, 'order_123');
    assert.strictEqual(res.body.data.paymentId, 'pay_123');
    assert.ok(res.body.data.verifiedAt);
    assert.strictEqual(nextCalled, false);
  });

  test('passes error to next middleware when service throws an exception', async () => {
    const errorObj = new Error('Database connection error');
    razorpayService.verifyPaymentSignature = () => true;
    supabaseService.updateOrderStatusPaid = async () => {
      throw errorObj;
    };

    const req = {
      body: {
        orderId: 'order_123',
        paymentId: 'pay_123',
        signature: 'valid_signature'
      }
    };
    const res = createMockRes();
    let passedError = null;
    const next = (err) => { passedError = err; };

    await verifyPaymentHandler(req, res, next);

    assert.strictEqual(passedError, errorObj);
  });
});
