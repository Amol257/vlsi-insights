const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

// Helper to load razorpayService with clean module cache and custom mocks
function loadServiceWithMocks({ mockRazorpay = null, mockEnv = null } = {}) {
  // Clear cache for related modules
  delete require.cache[require.resolve('../src/config/razorpay')];
  delete require.cache[require.resolve('../src/config/env')];
  delete require.cache[require.resolve('../src/services/razorpayService')];

  const defaultEnv = {
    RAZORPAY: {
      KEY_ID: 'rzp_test_key123',
      KEY_SECRET: 'prod_secret_456',
      WEBHOOK_SECRET: 'wh_secret_789'
    }
  };

  const envPath = require.resolve('../src/config/env');
  require.cache[envPath] = {
    id: envPath,
    filename: envPath,
    loaded: true,
    exports: mockEnv || defaultEnv
  };

  const razorpayPath = require.resolve('../src/config/razorpay');
  require.cache[razorpayPath] = {
    id: razorpayPath,
    filename: razorpayPath,
    loaded: true,
    exports: mockRazorpay
  };

  return require('../src/services/razorpayService');
}

describe('razorpayService', () => {
  describe('calculateOrderTotals', () => {
    it('calculates totals correctly with standard items and no promo code', () => {
      const { calculateOrderTotals } = loadServiceWithMocks();
      const items = [
        { price: 1000, qty: 2 },
        { price: 500, qty: 1 }
      ];
      // Subtotal = 2000 + 500 = 2500
      // Discount = 0
      // Taxable = 2500
      // Tax @ 18% = 450
      // Total = 2950
      const totals = calculateOrderTotals(items);
      assert.deepEqual(totals, {
        subtotal: 2500,
        discount: 0,
        tax: 450,
        total: 2950
      });
    });

    it('handles missing/invalid item price and qty gracefully', () => {
      const { calculateOrderTotals } = loadServiceWithMocks();
      const items = [
        { price: 'invalid', qty: null },
        { price: 100, qty: -2 }
      ];
      // Item 1: price 0, qty 1 -> 0
      // Item 2: price 100, qty Math.max(1, -2) = 1 -> 100
      // Subtotal = 100
      // Tax @ 18% = 18
      // Total = 118
      const totals = calculateOrderTotals(items);
      assert.equal(totals.subtotal, 100);
      assert.equal(totals.total, 118);
    });

    it('applies percentage discount promo code (VLSI10)', () => {
      const { calculateOrderTotals } = loadServiceWithMocks();
      const items = [{ price: 1000, qty: 1 }];
      // Subtotal = 1000
      // Discount 10% = 100
      // Taxable = 900
      // Tax @ 18% = 162
      // Total = 1062
      const totals = calculateOrderTotals(items, 'VLSI10');
      assert.equal(totals.subtotal, 1000);
      assert.equal(totals.discount, 100);
      assert.equal(totals.tax, 162);
      assert.equal(totals.total, 1062);
    });

    it('applies percentage promo code case-insensitively (early20)', () => {
      const { calculateOrderTotals } = loadServiceWithMocks();
      const items = [{ price: 1000, qty: 1 }];
      // Subtotal = 1000
      // Discount 20% = 200
      // Taxable = 800
      // Tax @ 18% = 144
      // Total = 944
      const totals = calculateOrderTotals(items, 'early20');
      assert.equal(totals.discount, 200);
      assert.equal(totals.total, 944);
    });

    it('applies flat discount promo code (FLAT5K) and caps discount at subtotal', () => {
      const { calculateOrderTotals } = loadServiceWithMocks();
      // Item subtotal less than 5000 flat discount
      const items = [{ price: 3000, qty: 1 }];
      const totals = calculateOrderTotals(items, 'FLAT5K');
      assert.equal(totals.subtotal, 3000);
      assert.equal(totals.discount, 3000); // capped at subtotal
      assert.equal(totals.tax, 0);
      assert.equal(totals.total, 0);
    });

    it('ignores unrecognized promo code', () => {
      const { calculateOrderTotals } = loadServiceWithMocks();
      const items = [{ price: 500, qty: 1 }];
      const totals = calculateOrderTotals(items, 'INVALID_CODE');
      assert.equal(totals.discount, 0);
    });
  });

  describe('createOrder', () => {
    it('throws error when items array is empty or missing', async () => {
      const { createOrder } = loadServiceWithMocks();
      await assert.rejects(
        async () => createOrder({ items: [] }),
        { name: 'Error', message: 'Cart cannot be empty' }
      );
      await assert.rejects(
        async () => createOrder({ items: null }),
        { name: 'Error', message: 'Cart cannot be empty' }
      );
      await assert.rejects(
        async () => createOrder({ items: 'not an array' }),
        { name: 'Error', message: 'Cart cannot be empty' }
      );
    });

    it('creates order in simulation mode when razorpay is null', async () => {
      const service = loadServiceWithMocks({ mockRazorpay: null });
      const result = await service.createOrder({
        items: [{ price: 100, qty: 1 }],
        promoCode: 'VLSI10',
        user: { id: 'usr_123' }
      });

      assert.equal(result.simulated, true);
      assert.match(result.orderId, /^order_sim_/);
      assert.match(result.receipt, /^rcpt_/);
      assert.equal(result.currency, 'INR');
      assert.equal(result.amount, 10600); // (100 - 10 + 16) * 100 = 10600 paise
      assert.equal(result.keyId, 'rzp_test_key123');
      assert.ok(result.totals);
    });

    it('creates order with active Razorpay client and passes options correctly', async () => {
      let createdOptions = null;
      const mockRazorpay = {
        orders: {
          create: async (options) => {
            createdOptions = options;
            return {
              id: 'order_rzp_real_999',
              amount: options.amount,
              currency: options.currency,
              receipt: options.receipt
            };
          }
        }
      };

      const service = loadServiceWithMocks({ mockRazorpay });
      const result = await service.createOrder({
        items: [{ price: 1000, qty: 1 }],
        promoCode: 'EARLY20',
        user: { id: 'usr_abc_789' }
      });

      assert.equal(result.orderId, 'order_rzp_real_999');
      assert.equal(result.amount, 94400); // (1000 - 200 + 144) * 100
      assert.equal(result.currency, 'INR');
      assert.equal(result.keyId, 'rzp_test_key123');
      assert.equal(result.simulated, undefined);

      assert.ok(createdOptions);
      assert.equal(createdOptions.amount, 94400);
      assert.equal(createdOptions.currency, 'INR');
      assert.match(createdOptions.receipt, /^rcpt_/);
      assert.deepEqual(createdOptions.notes, {
        user_id: 'usr_abc_789',
        items_count: '1',
        promo_code: 'EARLY20'
      });
    });

    it('handles user parameter fallbacks (user.email, user without id/email, missing user)', async () => {
      let createdOptions = null;
      const mockRazorpay = {
        orders: {
          create: async (options) => {
            createdOptions = options;
            return { id: 'order_123', amount: options.amount, currency: 'INR', receipt: options.receipt };
          }
        }
      };
      const service = loadServiceWithMocks({ mockRazorpay });

      // User with email but no id
      await service.createOrder({ items: [{ price: 100, qty: 1 }], user: { email: 'user@example.com' } });
      assert.equal(createdOptions.notes.user_id, 'user@example.com');
      assert.equal(createdOptions.notes.promo_code, 'NONE');

      // User object without id or email
      await service.createOrder({ items: [{ price: 100, qty: 1 }], user: {} });
      assert.equal(createdOptions.notes.user_id, 'guest');

      // Null user
      await service.createOrder({ items: [{ price: 100, qty: 1 }], user: null });
      assert.equal(createdOptions.notes.user_id, 'guest');
    });
  });

  describe('verifyPaymentSignature', () => {
    it('returns false if orderId or paymentId is missing', () => {
      const service = loadServiceWithMocks();
      assert.equal(service.verifyPaymentSignature({ paymentId: 'pay_123' }), false);
      assert.equal(service.verifyPaymentSignature({ orderId: 'order_123' }), false);
      assert.equal(service.verifyPaymentSignature({}), false);
    });

    it('returns true when orderId is a simulated order', () => {
      const service = loadServiceWithMocks();
      assert.equal(
        service.verifyPaymentSignature({ orderId: 'order_sim_abc123', paymentId: 'pay_123', signature: 'any' }),
        true
      );
    });

    it('returns true when RAZORPAY.KEY_SECRET is test_secret', () => {
      const service = loadServiceWithMocks({
        mockEnv: {
          RAZORPAY: { KEY_ID: 'rzp_key', KEY_SECRET: 'test_secret', WEBHOOK_SECRET: '' }
        }
      });
      assert.equal(
        service.verifyPaymentSignature({ orderId: 'order_real_123', paymentId: 'pay_123', signature: 'any' }),
        true
      );
    });

    it('verifies valid vs invalid HMAC SHA256 signature in production mode', () => {
      const keySecret = 'secret_key_prod_123';
      const service = loadServiceWithMocks({
        mockEnv: {
          RAZORPAY: { KEY_ID: 'rzp_key', KEY_SECRET: keySecret, WEBHOOK_SECRET: '' }
        }
      });

      const orderId = 'order_prod_999';
      const paymentId = 'pay_prod_888';

      const validSignature = crypto
        .createHmac('sha256', keySecret)
        .update(orderId + '|' + paymentId)
        .digest('hex');

      // Missing signature
      assert.equal(service.verifyPaymentSignature({ orderId, paymentId }), false);

      // Valid signature
      assert.equal(service.verifyPaymentSignature({ orderId, paymentId, signature: validSignature }), true);

      // Invalid signature
      assert.equal(service.verifyPaymentSignature({ orderId, paymentId, signature: 'invalid_sig' }), false);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('returns true when WEBHOOK_SECRET is empty or missing', () => {
      const service = loadServiceWithMocks({
        mockEnv: {
          RAZORPAY: { KEY_ID: 'key', KEY_SECRET: 'sec', WEBHOOK_SECRET: '' }
        }
      });
      assert.equal(service.verifyWebhookSignature('{"event":"payment.captured"}', 'any_sig'), true);
    });

    it('verifies valid vs invalid HMAC SHA256 webhook signature when secret is set', () => {
      const webhookSecret = 'whsec_prod_456';
      const service = loadServiceWithMocks({
        mockEnv: {
          RAZORPAY: { KEY_ID: 'key', KEY_SECRET: 'sec', WEBHOOK_SECRET: webhookSecret }
        }
      });

      const payload = '{"event":"payment.captured","account_id":"acc_123"}';
      const validSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      assert.equal(service.verifyWebhookSignature(payload, validSignature), true);
      assert.equal(service.verifyWebhookSignature(payload, 'wrong_signature'), false);
    });
  });
});
