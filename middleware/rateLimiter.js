const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const { logSecurityEvent, AUDIT_EVENTS } = require('./audit');

// Rate limiter for general API requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    logSecurityEvent(
      AUDIT_EVENTS.RATE_LIMIT_HIT,
      'General rate limit exceeded',
      { endpoint: req.path, method: req.method },
      req
    );
    res.status(429).json({
      error: 'Too many requests from this IP, please try again after 15 minutes.'
    });
  }
});

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    logSecurityEvent(
      AUDIT_EVENTS.RATE_LIMIT_HIT,
      'Authentication rate limit exceeded',
      { endpoint: req.path, method: req.method, attempts: 'exceeded_auth_limit' },
      req
    );
    res.status(429).json({
      error: 'Too many login attempts from this IP, please try again after 15 minutes.'
    });
  }
});

// Rate limiter for exercise submissions
const exerciseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 exercise submissions per minute
  message: {
    error: 'Too many exercise submissions, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Exercise rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    logSecurityEvent(
      AUDIT_EVENTS.RATE_LIMIT_HIT,
      'Exercise submission rate limit exceeded',
      { endpoint: req.path, method: req.method, exerciseId: req.params.exerciseId },
      req
    );
    res.status(429).json({
      error: 'Too many exercise submissions, please slow down.'
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  exerciseLimiter
};
