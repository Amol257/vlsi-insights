const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { calculateOrderTotals, PROMO_CODES } = require('../src/services/razorpayService');

describe('calculateOrderTotals', () => {
  describe('Standard calculations without promo code', () => {
    test('calculates correct totals for a single item with quantity 1', () => {
      const items = [{ price: 1000, qty: 1 }];
      const result = calculateOrderTotals(items);

      assert.deepEqual(result, {
        subtotal: 1000,
        discount: 0,
        tax: 180, // 18% of 1000
        total: 1180
      });
    });

    test('calculates correct totals for multiple items with various quantities', () => {
      const items = [
        { price: 1000, qty: 2 }, // 2000
        { price: 500, qty: 3 }   // 1500
      ];
      const result = calculateOrderTotals(items);

      assert.deepEqual(result, {
        subtotal: 3500,
        discount: 0,
        tax: 630, // 18% of 3500
        total: 4130
      });
    });
  });

  describe('Promo code discounts', () => {
    test('applies percentage-based promo code correctly (VLSI10 - 10%)', () => {
      const items = [{ price: 10000, qty: 1 }];
      const result = calculateOrderTotals(items, 'VLSI10');

      // subtotal: 10000, discount: 1000, taxable: 9000, tax: 1620, total: 10620
      assert.deepEqual(result, {
        subtotal: 10000,
        discount: 1000,
        tax: 1620,
        total: 10620
      });
    });

    test('applies percentage-based promo code with rounding (EARLY20 - 20%)', () => {
      const items = [{ price: 1055, qty: 1 }]; // 20% of 1055 = 211
      const result = calculateOrderTotals(items, 'EARLY20');

      assert.deepEqual(result, {
        subtotal: 1055,
        discount: 211,
        tax: 152, // 18% of (1055 - 211 = 844) = 151.92 -> Math.round -> 152
        total: 996
      });
    });

    test('applies flat-rate promo code correctly (FLAT5K - 5000 off)', () => {
      const items = [{ price: 15000, qty: 1 }];
      const result = calculateOrderTotals(items, 'FLAT5K');

      // subtotal: 15000, discount: 5000, taxable: 10000, tax: 1800, total: 11800
      assert.deepEqual(result, {
        subtotal: 15000,
        discount: 5000,
        tax: 1800,
        total: 11800
      });
    });

    test('caps flat-rate discount at subtotal when subtotal is less than flat discount', () => {
      const items = [{ price: 3000, qty: 1 }];
      const result = calculateOrderTotals(items, 'FLAT5K');

      // subtotal: 3000, discount capped at 3000, taxable: 0, tax: 0, total: 0
      assert.deepEqual(result, {
        subtotal: 3000,
        discount: 3000,
        tax: 0,
        total: 0
      });
    });

    test('handles promo code case-insensitively', () => {
      const items = [{ price: 10000, qty: 1 }];
      const resultLower = calculateOrderTotals(items, 'vlsi10');
      const resultUpper = calculateOrderTotals(items, 'VLSI10');

      assert.deepEqual(resultLower, resultUpper);
    });

    test('ignores invalid or unknown promo codes', () => {
      const items = [{ price: 10000, qty: 1 }];
      const result = calculateOrderTotals(items, 'INVALID_CODE');

      assert.deepEqual(result, {
        subtotal: 10000,
        discount: 0,
        tax: 1800,
        total: 11800
      });
    });
  });

  describe('Item quantity edge cases', () => {
    test('defaults zero quantity to 1', () => {
      const items = [{ price: 1000, qty: 0 }];
      const result = calculateOrderTotals(items);

      assert.equal(result.subtotal, 1000);
    });

    test('defaults negative quantity to 1', () => {
      const items = [{ price: 1000, qty: -5 }];
      const result = calculateOrderTotals(items);

      assert.equal(result.subtotal, 1000);
    });

    test('defaults missing or undefined quantity to 1', () => {
      const items = [{ price: 1000 }];
      const result = calculateOrderTotals(items);

      assert.equal(result.subtotal, 1000);
    });

    test('parses valid numeric string quantity', () => {
      const items = [{ price: 1000, qty: '3' }];
      const result = calculateOrderTotals(items);

      assert.equal(result.subtotal, 3000);
    });

    test('defaults non-numeric string quantity to 1', () => {
      const items = [{ price: 1000, qty: 'invalid' }];
      const result = calculateOrderTotals(items);

      assert.equal(result.subtotal, 1000);
    });
  });

  describe('Item price edge cases', () => {
    test('handles zero price correctly', () => {
      const items = [{ price: 0, qty: 2 }];
      const result = calculateOrderTotals(items);

      assert.deepEqual(result, {
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0
      });
    });

    test('parses numeric string price', () => {
      const items = [{ price: '2500', qty: 2 }];
      const result = calculateOrderTotals(items);

      assert.equal(result.subtotal, 5000);
    });

    test('defaults non-numeric price or missing price to 0', () => {
      const items = [
        { price: 'invalid', qty: 2 },
        { qty: 1 }
      ];
      const result = calculateOrderTotals(items);

      assert.equal(result.subtotal, 0);
    });
  });

  describe('GST Tax calculation and rounding', () => {
    test('rounds tax to nearest integer', () => {
      // subtotal 103 -> tax = 103 * 0.18 = 18.54 -> rounds to 19
      const items = [{ price: 103, qty: 1 }];
      const result = calculateOrderTotals(items);

      assert.equal(result.tax, 19);
      assert.equal(result.total, 122);
    });
  });
});
