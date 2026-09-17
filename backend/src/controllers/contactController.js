const supabaseService = require('../services/supabaseService');

/**
 * POST /api/contact
 */
async function submitContactHandler(req, res, next) {
  try {
    const { name, email, phone, message, source } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required fields'
      });
    }

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    const submission = await supabaseService.saveContactSubmission({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      message: message.trim(),
      source: source || 'website_contact'
    });

    return res.status(200).json({
      success: true,
      message: "Thank you! Your message has been received. We'll be in touch within 24 hours.",
      data: submission
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitContactHandler
};
