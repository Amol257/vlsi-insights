const supabase = require('../config/supabase');

/**
 * Record a new order in Supabase
 */
async function recordOrder({ orderId, userId, items, totals, promoCode, status = 'created' }) {
  if (!supabase) {
    console.log('[SupabaseService] Client not configured, skipping order record in DB');
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
      console.error('[SupabaseService] Insert order error:', error.message);
      throw new Error(`Database insert failed: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('[SupabaseService] Error recording order:', err.message);
    throw err;
  }
}

/**
 * Update order status to paid
 */
async function updateOrderStatusPaid({ orderId, paymentId, signature }) {
  if (!supabase) {
    throw new Error('[SupabaseService] Client not configured');
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
      console.error('[SupabaseService] Update order error:', error.message);
      throw new Error(`Database update failed: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('[SupabaseService] Error updating order status:', err.message);
    throw err;
  }
}

/**
 * Create user enrollments from order items
 */
async function createEnrollmentsFromOrder({ orderId, userId, items }) {
  if (!supabase || !userId || !items || !items.length) {
    return [];
  }

  try {
    const enrollments = [];
    for (const item of items) {
      // Each item should have programId and programName
      const programId = item.programId || item.id;
      const programName = item.programName || item.name || item.title;
      
      if (!programId || !programName) continue;

      const { data, error } = await supabase
        .from('user_enrollments')
        .upsert({
          user_id: userId,
          program_id: programId,
          program_name: programName,
          order_id: orderId,
          status: 'active',
          enrolled_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,program_id'
        })
        .select()
        .single();

      if (error) {
        console.warn('[SupabaseService] Error creating enrollment:', error.message);
      } else {
        enrollments.push(data);
      }
    }
    return enrollments;
  } catch (err) {
    console.error('[SupabaseService] Exception creating enrollments:', err.message);
    return [];
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

/**
 * Fetch active user enrollments for lab access gating
 */
async function getUserEnrollments(userId) {
  if (!supabase || !userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('[SupabaseService] Error querying user_enrollments:', error.message);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('[SupabaseService] Exception in getUserEnrollments:', e.message);
    return [];
  }
}

module.exports = {
  recordOrder,
  updateOrderStatusPaid,
  createEnrollmentsFromOrder,
  saveContactSubmission,
  saveEnrollmentSubmission,
  getUserEnrollments
};
