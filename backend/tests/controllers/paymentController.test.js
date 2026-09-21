const request = require('supertest');
const app = require('../../src/app');
const razorpayService = require('../../src/services/razorpayService');
const supabaseService = require('../../src/services/supabaseService');

jest.mock('../../src/services/razorpayService');
jest.mock('../../src/services/supabaseService');

describe('Payment Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payments/create-order (createOrderHandler)', () => {
    const mockOrderData = {
      orderId: 'order_test_123',
      amount: 11800,
      currency: 'INR',
      receipt: 'rcpt_test_123',
      totals: {
        subtotal: 100,
        discount: 0,
        tax: 18,
        total: 118
      },
      keyId: 'rzp_test_key'
    };

    const validItems = [
      { id: 'course_1', name: 'VLSI Design Course', price: 100, qty: 1 }
    ];

    describe('Validation Failures', () => {
      it('should return 400 when items property is missing', async () => {
        const response = await request(app)
          .post('/api/payments/create-order')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          error: 'Invalid request: "items" must be a non-empty array'
        });
        expect(razorpayService.createOrder).not.toHaveBeenCalled();
        expect(supabaseService.recordOrder).not.toHaveBeenCalled();
      });

      it('should return 400 when items is not an array', async () => {
        const response = await request(app)
          .post('/api/payments/create-order')
          .send({ items: 'not-an-array' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          error: 'Invalid request: "items" must be a non-empty array'
        });
        expect(razorpayService.createOrder).not.toHaveBeenCalled();
        expect(supabaseService.recordOrder).not.toHaveBeenCalled();
      });

      it('should return 400 when items array is empty', async () => {
        const response = await request(app)
          .post('/api/payments/create-order')
          .send({ items: [] });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          error: 'Invalid request: "items" must be a non-empty array'
        });
        expect(razorpayService.createOrder).not.toHaveBeenCalled();
        expect(supabaseService.recordOrder).not.toHaveBeenCalled();
      });
    });

    describe('Happy Paths', () => {
      it('should successfully create an order for a guest user', async () => {
        razorpayService.createOrder.mockResolvedValue(mockOrderData);
        supabaseService.recordOrder.mockResolvedValue({
          order_id: 'order_test_123',
          status: 'created'
        });

        const response = await request(app)
          .post('/api/payments/create-order')
          .send({ items: validItems });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          data: mockOrderData
        });

        expect(razorpayService.createOrder).toHaveBeenCalledTimes(1);
        expect(razorpayService.createOrder).toHaveBeenCalledWith({
          items: validItems,
          promoCode: undefined,
          user: null
        });

        expect(supabaseService.recordOrder).toHaveBeenCalledTimes(1);
        expect(supabaseService.recordOrder).toHaveBeenCalledWith({
          orderId: 'order_test_123',
          userId: null,
          items: validItems,
          totals: mockOrderData.totals,
          promoCode: undefined,
          status: 'created'
        });
      });

      it('should successfully create an order with promo code and user in body', async () => {
        const mockUser = { id: 'usr_789', email: 'student@example.com' };
        razorpayService.createOrder.mockResolvedValue(mockOrderData);
        supabaseService.recordOrder.mockResolvedValue({
          order_id: 'order_test_123',
          status: 'created'
        });

        const response = await request(app)
          .post('/api/payments/create-order')
          .send({
            items: validItems,
            promoCode: 'VLSI10',
            user: mockUser
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          data: mockOrderData
        });

        expect(razorpayService.createOrder).toHaveBeenCalledWith({
          items: validItems,
          promoCode: 'VLSI10',
          user: mockUser
        });

        expect(supabaseService.recordOrder).toHaveBeenCalledWith({
          orderId: 'order_test_123',
          userId: 'usr_789',
          items: validItems,
          totals: mockOrderData.totals,
          promoCode: 'VLSI10',
          status: 'created'
        });
      });
    });

    describe('Error Handling', () => {
      it('should handle errors from razorpayService and pass to error middleware', async () => {
        const error = new Error('Razorpay service failed');
        razorpayService.createOrder.mockRejectedValue(error);

        const response = await request(app)
          .post('/api/payments/create-order')
          .send({ items: validItems });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          success: false,
          error: 'Razorpay service failed'
        });
        expect(supabaseService.recordOrder).not.toHaveBeenCalled();
      });

      it('should handle errors from supabaseService and pass to error middleware', async () => {
        razorpayService.createOrder.mockResolvedValue(mockOrderData);
        const error = new Error('Supabase database error');
        supabaseService.recordOrder.mockRejectedValue(error);

        const response = await request(app)
          .post('/api/payments/create-order')
          .send({ items: validItems });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          success: false,
          error: 'Supabase database error'
        });
      });
    });
  });

  describe('POST /api/payments/verify (verifyPaymentHandler)', () => {
    it('should return 400 when orderId or paymentId is missing', async () => {
      const response = await request(app)
        .post('/api/payments/verify')
        .send({ orderId: 'order_123' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'orderId and paymentId are required'
      });
    });

    it('should return 400 when payment signature is invalid', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(false);

      const response = await request(app)
        .post('/api/payments/verify')
        .send({
          orderId: 'order_123',
          paymentId: 'pay_123',
          signature: 'invalid_sig'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Cryptographic payment verification failed'
      });
      expect(supabaseService.updateOrderStatusPaid).not.toHaveBeenCalled();
    });

    it('should verify payment successfully and update status to paid in database', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      supabaseService.updateOrderStatusPaid.mockResolvedValue({
        order_id: 'order_123',
        status: 'paid'
      });

      const response = await request(app)
        .post('/api/payments/verify')
        .send({
          orderId: 'order_123',
          paymentId: 'pay_123',
          signature: 'valid_sig'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment verified and enrollment confirmed');
      expect(response.body.data.orderId).toBe('order_123');
      expect(response.body.data.paymentId).toBe('pay_123');
      expect(supabaseService.updateOrderStatusPaid).toHaveBeenCalledWith({
        orderId: 'order_123',
        paymentId: 'pay_123',
        signature: 'valid_sig'
      });
    });

    it('should pass unexpected error to error handling middleware', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      supabaseService.updateOrderStatusPaid.mockRejectedValue(new Error('DB Update Failed'));

      const response = await request(app)
        .post('/api/payments/verify')
        .send({
          orderId: 'order_123',
          paymentId: 'pay_123',
          signature: 'valid_sig'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'DB Update Failed'
      });
    });
  });

  describe('POST /api/payments/webhook (webhookHandler)', () => {
    it('should return 400 when webhook signature is invalid', async () => {
      razorpayService.verifyWebhookSignature.mockReturnValue(false);

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'invalid_sig')
        .send({ event: 'payment.captured' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid webhook signature' });
    });

    it('should process payment.captured event and mark order as paid', async () => {
      razorpayService.verifyWebhookSignature.mockReturnValue(true);
      supabaseService.updateOrderStatusPaid.mockResolvedValue({ status: 'paid' });

      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              order_id: 'order_wh_123',
              id: 'pay_wh_123'
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'valid_sig')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
      expect(supabaseService.updateOrderStatusPaid).toHaveBeenCalledWith({
        orderId: 'order_wh_123',
        paymentId: 'pay_wh_123',
        signature: 'webhook_captured'
      });
    });

    it('should acknowledge other webhook events without updating status', async () => {
      razorpayService.verifyWebhookSignature.mockReturnValue(true);

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'valid_sig')
        .send({ event: 'payment.failed' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
      expect(supabaseService.updateOrderStatusPaid).not.toHaveBeenCalled();
    });

    it('should pass errors to next error handler', async () => {
      razorpayService.verifyWebhookSignature.mockImplementation(() => {
        throw new Error('Webhook error');
      });

      const response = await request(app)
        .post('/api/payments/webhook')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Webhook error'
      });
    });
  });
});
