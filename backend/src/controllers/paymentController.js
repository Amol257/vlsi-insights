const razorpayService = require('../services/razorpayService');
const supabaseService = require('../services/supabaseService');

/**
 * POST /api/payments/create-order
 */
async function createOrderHandler(req, res, next) {
  try {
    const { items, promoCode } = req.body;
    const user = req.user || req.body.user || null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: "items" must be a non-empty array'
      });
    }

    const orderData = await razorpayService.createOrder({ items, promoCode, user });

    // Persist pending order to Supabase
    await supabaseService.recordOrder({
      orderId: orderData.orderId,
      userId: user ? user.id : null,
      items: items,
      totals: orderData.totals,
      promoCode: promoCode,
      status: 'created'
    });

    return res.status(200).json({
      success: true,
      data: orderData
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/verify
 */
async function verifyPaymentHandler(req, res, next) {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({
        success: false,
        error: 'orderId and paymentId are required'
      });
    }

    const isValid = razorpayService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Cryptographic payment verification failed'
      });
    }

    // Mark order paid in Supabase
    await supabaseService.updateOrderStatusPaid({
      orderId,
      paymentId,
      signature
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and enrollment confirmed',
      data: {
        orderId,
        paymentId,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/webhook
 */
async function webhookHandler(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const bodyStr = JSON.stringify(req.body);

    const isValid = razorpayService.verifyWebhookSignature(bodyStr, signature);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    console.log('[Razorpay Webhook] Event received:', event);

    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      await supabaseService.updateOrderStatusPaid({
        orderId,
        paymentId,
        signature: 'webhook_captured'
      });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrderHandler,
  verifyPaymentHandler,
  webhookHandler
};
