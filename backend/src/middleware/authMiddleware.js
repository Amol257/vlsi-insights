const supabase = require('../config/supabase');

/**
 * Optional Supabase auth middleware. If token is present, populates req.user.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!supabase) {
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      req.user = user;
    }
  } catch (err) {
    // Graceful pass-through for optional auth
  }

  next();
}

/**
 * Required Supabase auth middleware. Rejects if not logged in.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Auth service not available on server.'
    });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Failed to verify auth session: ' + err.message
    });
  }
}

module.exports = {
  optionalAuth,
  requireAuth
};
