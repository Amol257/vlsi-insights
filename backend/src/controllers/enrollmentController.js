const supabaseService = require('../services/supabaseService');

/**
 * POST /api/enrollment
 */
async function submitEnrollmentHandler(req, res, next) {
  try {
    const { name, email, phone, program, degree, gradYear, source } = req.body;

    if (!name || !email || !program) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and program are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    const record = await supabaseService.saveEnrollmentSubmission({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      program: program.trim(),
      degree: degree ? degree.trim() : null,
      gradYear: gradYear ? gradYear.trim() : null,
      source: source || 'programs_page'
    });

    return res.status(200).json({
      success: true,
      message: 'Application received successfully! Our academic counseling team will reach out with the syllabus.',
      data: record
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitEnrollmentHandler
};
