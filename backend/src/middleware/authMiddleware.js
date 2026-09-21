const supabase = require('../config/supabase');

/**
 * Optional Supabase auth middleware. If token is present, populates req.user.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers ? req.headers.authorization : undefined;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7).trim();
  if (!token || !supabase) {
    return next();
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data && data.user) {
      req.user = data.user;
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
  const authHeader = req.headers ? req.headers.authorization : undefined;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed Bearer token.'
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed Bearer token.'
    });
  }

  if (!supabase) {
    return res.status(503).json({
      success: false,
      error: 'Auth service not available on server.'
    });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data || !data.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token.'
      });
    }

    req.user = data.user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token.'
    });
  }
}

module.exports = {
  optionalAuth,
  requireAuth
};
