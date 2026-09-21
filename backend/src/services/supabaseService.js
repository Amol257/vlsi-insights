const supabase = require('../config/supabase');

/**
 * Record a new order in Supabase
 */
async function recordOrder({ orderId, userId, items, totals, promoCode, status = 'created' }) {
  if (!supabase) {
    return { orderId, status };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: userId || null,
        items: items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        promo_code: promoCode || null,
        status: status,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn('[SupabaseService] Insert order warning (table may need schema migration):', error.message);
      return { orderId, status, warning: error.message };
    }

    return data;
  } catch (err) {
    console.error('[SupabaseService] Error recording order:', err.message);
    return { orderId, status, error: err.message };
  }
}

/**
 * Update order status to paid
 */
async function updateOrderStatusPaid({ orderId, paymentId, signature }) {
  if (!supabase) {
    return { orderId, status: 'paid' };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_id: paymentId,
        signature: signature,
        paid_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) {
      console.warn('[SupabaseService] Update order warning:', error.message);
      return { orderId, status: 'paid', warning: error.message };
    }

    return data;
  } catch (err) {
    console.error('[SupabaseService] Error updating order status:', err.message);
    return { orderId, status: 'paid', error: err.message };
  }
}

/**
 * Save contact submission
 */
async function saveContactSubmission({ name, email, phone, message, source = 'website' }) {
  if (!supabase) {
    return { success: true, simulated: true };
  }

  const payload = {
    name: name,
    email: email,
    phone: phone || null,
    message: source ? `[${source}] ${message}` : message
  };

  const { data, error } = await supabase
    .from('contact_submissions')
    .insert(payload)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return (data && data[0]) || { success: true };
}

/**
 * Save enrollment submission / syllabus lead
 */
async function saveEnrollmentSubmission({ name, email, phone, program, degree, gradYear, source = 'enrollment_form' }) {
  if (!supabase) {
    return { success: true, simulated: true };
  }

  const messageDetails = [
    source ? `Source: ${source}` : null,
    degree ? `Degree: ${degree}` : null,
    gradYear ? `Grad Year: ${gradYear}` : null
  ].filter(Boolean).join(' | ');

  const payload = {
    name: name,
    email: email,
    phone: phone || null,
    program: program,
    message: messageDetails || null
  };

  const { data, error } = await supabase
    .from('enrollment_submissions')
    .insert(payload)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return (data && data[0]) || { success: true };
}

module.exports = {
  recordOrder,
  updateOrderStatusPaid,
  saveContactSubmission,
  saveEnrollmentSubmission
};
