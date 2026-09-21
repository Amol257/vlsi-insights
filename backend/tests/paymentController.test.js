const request = require('supertest');
const app = require('../src/app');
const razorpayService = require('../src/services/razorpayService');
const supabaseService = require('../src/services/supabaseService');

// Mock external services
jest.mock('../src/services/razorpayService');
jest.mock('../src/services/supabaseService');

describe('Payment Controller - Webhook Handler & Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payments/webhook', () => {
    it('should return 400 when webhook signature is invalid', async () => {
      razorpayService.verifyWebhookSignature.mockReturnValue(false);

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'invalid_sig')
        .send({
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: 'pay_test123',
                order_id: 'order_test123'
              }
            }
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid webhook signature' });
      expect(razorpayService.verifyWebhookSignature).toHaveBeenCalledTimes(1);
      expect(supabaseService.updateOrderStatusPaid).not.toHaveBeenCalled();
    });

    it('should process payment.captured event and update order status to paid', async () => {
      razorpayService.verifyWebhookSignature.mockReturnValue(true);
      supabaseService.updateOrderStatusPaid.mockResolvedValue({
        order_id: 'order_abc123',
        status: 'paid'
      });

      const payloadBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_xyz789',
              order_id: 'order_abc123'
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'valid_signature')
        .send(payloadBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
      expect(razorpayService.verifyWebhookSignature).toHaveBeenCalledWith(
        JSON.stringify(payloadBody),
        'valid_signature'
      );
      expect(supabaseService.updateOrderStatusPaid).toHaveBeenCalledWith({
        orderId: 'order_abc123',
        paymentId: 'pay_xyz789',
        signature: 'webhook_captured'
      });
    });

    it('should return 200 without updating order status for non-payment.captured events', async () => {
      razorpayService.verifyWebhookSignature.mockReturnValue(true);

      const payloadBody = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_fail123',
              order_id: 'order_fail123'
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'valid_signature')
        .send(payloadBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
      expect(razorpayService.verifyWebhookSignature).toHaveBeenCalledTimes(1);
      expect(supabaseService.updateOrderStatusPaid).not.toHaveBeenCalled();
    });

    it('should pass error to error handler middleware when processing fails', async () => {
      razorpayService.verifyWebhookSignature.mockReturnValue(true);
      supabaseService.updateOrderStatusPaid.mockRejectedValue(new Error('Database connection failed'));

      const payloadBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_err123',
              order_id: 'order_err123'
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'valid_signature')
        .send(payloadBody);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(supabaseService.updateOrderStatusPaid).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/payments/create-order', () => {
    it('should return 400 when items array is missing or empty', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .send({ items: [] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/items.*must be a non-empty array/i);
    });

    it('should create order and record order in supabase when payload is valid', async () => {
      const mockOrderData = {
        orderId: 'order_123',
        amount: 500000,
        currency: 'INR',
        totals: { subtotal: 5000, discount: 0, tax: 0, total: 5000 }
      };

      razorpayService.createOrder.mockResolvedValue(mockOrderData);
      supabaseService.recordOrder.mockResolvedValue({ id: 1, order_id: 'order_123' });

      const response = await request(app)
        .post('/api/payments/create-order')
        .send({
          items: [{ title: 'VLSI Masterclass', price: 5000, qty: 1 }],
          promoCode: 'VLSI10'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockOrderData);
      expect(razorpayService.createOrder).toHaveBeenCalledWith({
        items: [{ title: 'VLSI Masterclass', price: 5000, qty: 1 }],
        promoCode: 'VLSI10',
        user: null
      });
      expect(supabaseService.recordOrder).toHaveBeenCalledWith({
        orderId: 'order_123',
        userId: null,
        items: [{ title: 'VLSI Masterclass', price: 5000, qty: 1 }],
        totals: mockOrderData.totals,
        promoCode: 'VLSI10',
        status: 'created'
      });
    });
  });

  describe('POST /api/payments/verify', () => {
    it('should return 400 if orderId or paymentId is missing', async () => {
      const response = await request(app)
        .post('/api/payments/verify')
        .send({ orderId: 'order_123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/orderId and paymentId are required/i);
    });

    it('should return 400 if signature verification fails', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(false);

      const response = await request(app)
        .post('/api/payments/verify')
        .send({
          orderId: 'order_123',
          paymentId: 'pay_123',
          signature: 'invalid_sig'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/verification failed/i);
    });

    it('should return 200 and update status when payment verification succeeds', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      supabaseService.updateOrderStatusPaid.mockResolvedValue({ status: 'paid' });

      const response = await request(app)
        .post('/api/payments/verify')
        .send({
          orderId: 'order_123',
          paymentId: 'pay_123',
          signature: 'valid_sig'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe('order_123');
      expect(response.body.data.paymentId).toBe('pay_123');
      expect(supabaseService.updateOrderStatusPaid).toHaveBeenCalledWith({
        orderId: 'order_123',
        paymentId: 'pay_123',
        signature: 'valid_sig'
      });
    });
  });
});
