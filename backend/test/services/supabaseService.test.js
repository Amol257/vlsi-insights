const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const configPath = path.resolve(__dirname, '../../src/config/supabase.js');
const servicePath = path.resolve(__dirname, '../../src/services/supabaseService.js');

/**
 * Helper to load `supabaseService` with a custom `supabase` client mock.
 */
function loadSupabaseServiceWithMock(mockSupabaseClient) {
  delete require.cache[configPath];
  delete require.cache[servicePath];

  require.cache[configPath] = {
    id: configPath,
    filename: configPath,
    loaded: true,
    exports: mockSupabaseClient
  };

  return require('../../src/services/supabaseService');
}

describe('supabaseService - updateOrderStatusPaid', () => {
  test('returns fallback paid status object when supabase client is null/unconfigured', async () => {
    const supabaseService = loadSupabaseServiceWithMock(null);

    const result = await supabaseService.updateOrderStatusPaid({
      orderId: 'order_12345',
      paymentId: 'pay_98765',
      signature: 'sig_abc123'
    });

    assert.deepStrictEqual(result, {
      orderId: 'order_12345',
      status: 'paid'
    });
  });

  test('successfully updates order status to paid in Supabase with correct table, payload, and filter', async () => {
    let capturedTable = null;
    let capturedUpdatePayload = null;
    let capturedEqField = null;
    let capturedEqValue = null;
    let selectCalled = false;
    let singleCalled = false;

    const mockData = {
      id: 'uuid-101',
      order_id: 'order_12345',
      status: 'paid',
      payment_id: 'pay_98765',
      signature: 'sig_abc123',
      paid_at: new Date().toISOString()
    };

    const mockSupabase = {
      from(tableName) {
        capturedTable = tableName;
        return {
          update(payload) {
            capturedUpdatePayload = payload;
            return {
              eq(field, value) {
                capturedEqField = field;
                capturedEqValue = value;
                return {
                  select() {
                    selectCalled = true;
                    return {
                      async single() {
                        singleCalled = true;
                        return { data: mockData, error: null };
                      }
                    };
                  }
                };
              }
            };
          }
        };
      }
    };

    const supabaseService = loadSupabaseServiceWithMock(mockSupabase);

    const result = await supabaseService.updateOrderStatusPaid({
      orderId: 'order_12345',
      paymentId: 'pay_98765',
      signature: 'sig_abc123'
    });

    // Assert DB queries were formed correctly
    assert.strictEqual(capturedTable, 'orders');
    assert.strictEqual(capturedEqField, 'order_id');
    assert.strictEqual(capturedEqValue, 'order_12345');
    assert.strictEqual(selectCalled, true);
    assert.strictEqual(singleCalled, true);

    // Assert update payload structure
    assert.strictEqual(capturedUpdatePayload.status, 'paid');
    assert.strictEqual(capturedUpdatePayload.payment_id, 'pay_98765');
    assert.strictEqual(capturedUpdatePayload.signature, 'sig_abc123');
    assert.ok(typeof capturedUpdatePayload.paid_at === 'string');
    assert.ok(!isNaN(Date.parse(capturedUpdatePayload.paid_at)));

    // Assert returned result matches database response
    assert.deepStrictEqual(result, mockData);
  });

  test('handles Supabase returned error gracefully with a warning response', async () => {
    const mockSupabase = {
      from() {
        return {
          update() {
            return {
              eq() {
                return {
                  select() {
                    return {
                      async single() {
                        return {
                          data: null,
                          error: { message: 'Column signature does not exist' }
                        };
                      }
                    };
                  }
                };
              }
            };
          }
        };
      }
    };

    const supabaseService = loadSupabaseServiceWithMock(mockSupabase);

    const result = await supabaseService.updateOrderStatusPaid({
      orderId: 'order_12345',
      paymentId: 'pay_98765',
      signature: 'sig_abc123'
    });

    assert.deepStrictEqual(result, {
      orderId: 'order_12345',
      status: 'paid',
      warning: 'Column signature does not exist'
    });
  });

  test('handles thrown exception during Supabase update operation', async () => {
    const mockSupabase = {
      from() {
        return {
          update() {
            return {
              eq() {
                return {
                  select() {
                    return {
                      single() {
                        return Promise.reject(new Error('Connection lost'));
                      }
                    };
                  }
                };
              }
            };
          }
        };
      }
    };

    const supabaseService = loadSupabaseServiceWithMock(mockSupabase);

    const result = await supabaseService.updateOrderStatusPaid({
      orderId: 'order_12345',
      paymentId: 'pay_98765',
      signature: 'sig_abc123'
    });

    assert.deepStrictEqual(result, {
      orderId: 'order_12345',
      status: 'paid',
      error: 'Connection lost'
    });
  });
});

describe('supabaseService - additional service methods', () => {
  test('recordOrder handles null supabase and configured supabase', async () => {
    const serviceNull = loadSupabaseServiceWithMock(null);
    const nullRes = await serviceNull.recordOrder({ orderId: 'ord_1', totals: { subtotal: 100, discount: 0, tax: 10, total: 110 } });
    assert.deepStrictEqual(nullRes, { orderId: 'ord_1', status: 'created' });

    let capturedPayload = null;
    const mockSupabase = {
      from(table) {
        assert.strictEqual(table, 'orders');
        return {
          insert(payload) {
            capturedPayload = payload;
            return {
              select() {
                return {
                  async single() {
                    return { data: { id: 'rec_1', ...payload }, error: null };
                  }
                };
              }
            };
          }
        };
      }
    };

    const serviceWithClient = loadSupabaseServiceWithMock(mockSupabase);
    const recRes = await serviceWithClient.recordOrder({
      orderId: 'ord_2',
      userId: 'user_1',
      items: [{ id: 'item_1' }],
      totals: { subtotal: 100, discount: 10, tax: 18, total: 108 },
      promoCode: 'SAVE10',
      status: 'pending'
    });

    assert.strictEqual(recRes.order_id, 'ord_2');
    assert.strictEqual(capturedPayload.subtotal, 100);
    assert.strictEqual(capturedPayload.discount, 10);
    assert.strictEqual(capturedPayload.tax, 18);
    assert.strictEqual(capturedPayload.total, 108);
    assert.strictEqual(capturedPayload.promo_code, 'SAVE10');
    assert.strictEqual(capturedPayload.status, 'pending');
  });

  test('saveContactSubmission handles simulated and active supabase', async () => {
    const serviceNull = loadSupabaseServiceWithMock(null);
    const nullRes = await serviceNull.saveContactSubmission({ name: 'Alice', email: 'alice@example.com', message: 'Hello' });
    assert.deepStrictEqual(nullRes, { success: true, simulated: true });

    let capturedPayload = null;
    const mockSupabase = {
      from(table) {
        assert.strictEqual(table, 'contact_submissions');
        return {
          insert(payload) {
            capturedPayload = payload;
            return {
              async select() {
                return { data: [{ id: 'c_1', ...payload }], error: null };
              }
            };
          }
        };
      }
    };

    const serviceClient = loadSupabaseServiceWithMock(mockSupabase);
    const res = await serviceClient.saveContactSubmission({ name: 'Alice', email: 'alice@example.com', message: 'Hello', source: 'contact' });
    assert.strictEqual(res.id, 'c_1');
    assert.strictEqual(capturedPayload.message, '[contact] Hello');
  });

  test('saveEnrollmentSubmission handles simulated and active supabase', async () => {
    const serviceNull = loadSupabaseServiceWithMock(null);
    const nullRes = await serviceNull.saveEnrollmentSubmission({ name: 'Bob', email: 'bob@example.com', program: 'VLSI' });
    assert.deepStrictEqual(nullRes, { success: true, simulated: true });

    let capturedPayload = null;
    const mockSupabase = {
      from(table) {
        assert.strictEqual(table, 'enrollment_submissions');
        return {
          insert(payload) {
            capturedPayload = payload;
            return {
              async select() {
                return { data: [{ id: 'e_1', ...payload }], error: null };
              }
            };
          }
        };
      }
    };

    const serviceClient = loadSupabaseServiceWithMock(mockSupabase);
    const res = await serviceClient.saveEnrollmentSubmission({
      name: 'Bob',
      email: 'bob@example.com',
      program: 'VLSI Design',
      degree: 'B.Tech',
      gradYear: '2025',
      source: 'enrollment_form'
    });
    assert.strictEqual(res.id, 'e_1');
    assert.strictEqual(capturedPayload.program, 'VLSI Design');
    assert.strictEqual(capturedPayload.message, 'Source: enrollment_form | Degree: B.Tech | Grad Year: 2025');
  });
});
