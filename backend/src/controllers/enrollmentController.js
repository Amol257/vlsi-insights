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

/**
 * GET /api/enrollment/verify-lab-access
 * Verifies if user has active enrollment before granting EDA lab / QuestaSim links
 */
async function verifyLabAccessHandler(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        authorized: false,
        error: 'Authentication required. Please sign in to verify your enrollment.'
      });
    }

    const enrollments = await supabaseService.getUserEnrollments(user.id);
    const now = new Date();
    const activeEnrollment = enrollments.find(e => 
      e.status === 'active' && 
      (!e.expires_at || new Date(e.expires_at) > now)
    );

    if (!activeEnrollment) {
      return res.status(403).json({
        success: false,
        authorized: false,
        error: 'Active course enrollment required to access EDA Playground environments and QuestaSim toolchains.',
        upgradeUrl: '/programs'
      });
    }

    return res.status(200).json({
      success: true,
      authorized: true,
      message: 'Active semiconductor cohort detected. Access authorized.',
      data: {
        programId: activeEnrollment.program_id,
        programName: activeEnrollment.program_name,
        enrolledAt: activeEnrollment.enrolled_at,
        edaPlaygroundStatus: 'provisioned'
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitEnrollmentHandler,
  verifyLabAccessHandler
};
