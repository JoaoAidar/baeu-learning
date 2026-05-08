const crypto = require('crypto');
const logger = require('../utils/logger');

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints that use JWT authentication
  if (req.path.startsWith('/api/auth/')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._token;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    logger.warn(`CSRF token mismatch for IP: ${req.ip}, Path: ${req.path}, User: ${req.user?.id || 'anonymous'}`);
    return res.status(403).json({
      error: 'Invalid CSRF token'
    });
  }

  next();
};

// Middleware to set CSRF token in session
const setCSRFToken = (req, res, next) => {
  if (!req.session) {
    return next();
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }

  // Make token available to views
  res.locals.csrfToken = req.session.csrfToken;
  
  next();
};

// Route to get CSRF token
const getCSRFToken = (req, res) => {
  if (!req.session) {
    return res.status(500).json({ error: 'Session not available' });
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }

  res.json({ csrfToken: req.session.csrfToken });
};

module.exports = {
  csrfProtection,
  setCSRFToken,
  getCSRFToken,
  generateCSRFToken
};
