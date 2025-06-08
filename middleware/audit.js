const logger = require('../utils/logger');
const { supabase } = require('../config/supabase');

// Audit log levels
const AUDIT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Audit event types
const AUDIT_EVENTS = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  PASSWORD_CHANGE: 'password_change',
  EXERCISE_SUBMIT: 'exercise_submit',
  PROGRESS_UPDATE: 'progress_update',
  ADMIN_ACTION: 'admin_action',
  DATA_ACCESS: 'data_access',
  SECURITY_EVENT: 'security_event',
  RATE_LIMIT_HIT: 'rate_limit_hit',
  AUTHENTICATION_FAILURE: 'auth_failure'
};

// Log audit event to database and file
const logAuditEvent = async (eventType, level, message, details = {}, req = null) => {
  const auditEntry = {
    event_type: eventType,
    level: level,
    message: message,
    details: JSON.stringify(details),
    user_id: req?.user?.id || req?.user?.userId || null,
    ip_address: req?.ip || null,
    user_agent: req?.get('User-Agent') || null,
    path: req?.path || null,
    method: req?.method || null,
    timestamp: new Date().toISOString()
  };

  try {
    // Log to database
    const { error } = await supabase
      .from('audit_logs')
      .insert([auditEntry]);

    if (error) {
      logger.error('Failed to insert audit log to database:', error);
    }

    // Also log to file system
    logger.info(`AUDIT: ${eventType} - ${message}`, {
      ...auditEntry,
      details: details
    });

  } catch (error) {
    logger.error('Audit logging failed:', error);
  }
};

// Middleware to log all requests
const auditMiddleware = (req, res, next) => {
  const start = Date.now();

  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    
    // Log request completion
    logAuditEvent(
      AUDIT_EVENTS.DATA_ACCESS,
      AUDIT_LEVELS.INFO,
      `API Request: ${req.method} ${req.path}`,
      {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        bodySize: JSON.stringify(body).length
      },
      req
    );

    return originalJson.call(this, body);
  };

  next();
};

// Middleware to log authentication events
const auditAuth = (eventType, success = true) => {
  return (req, res, next) => {
    const level = success ? AUDIT_LEVELS.INFO : AUDIT_LEVELS.WARNING;
    const message = success ? 
      `Authentication successful: ${eventType}` : 
      `Authentication failed: ${eventType}`;

    logAuditEvent(eventType, level, message, {
      success: success,
      username: req.body?.username || req.body?.email || 'unknown'
    }, req);

    next();
  };
};

// Middleware to log exercise submissions
const auditExercise = (req, res, next) => {
  // Store original data for logging
  req.auditData = {
    exerciseId: req.params.exerciseId,
    submittedAt: new Date().toISOString()
  };

  // Override res.json to capture success/failure
  const originalJson = res.json;
  res.json = function(body) {
    const success = res.statusCode < 400;
    
    logAuditEvent(
      AUDIT_EVENTS.EXERCISE_SUBMIT,
      success ? AUDIT_LEVELS.INFO : AUDIT_LEVELS.ERROR,
      `Exercise submission ${success ? 'successful' : 'failed'}`,
      {
        exerciseId: req.auditData.exerciseId,
        success: success,
        statusCode: res.statusCode,
        response: success ? 'Exercise completed' : body.error || 'Unknown error'
      },
      req
    );

    return originalJson.call(this, body);
  };

  next();
};

// Middleware to log admin actions
const auditAdmin = (action) => {
  return (req, res, next) => {
    logAuditEvent(
      AUDIT_EVENTS.ADMIN_ACTION,
      AUDIT_LEVELS.WARNING,
      `Admin action: ${action}`,
      {
        action: action,
        targetResource: req.params,
        requestBody: req.body
      },
      req
    );

    next();
  };
};

// Log security events (rate limiting, suspicious activity)
const logSecurityEvent = (eventType, message, details, req) => {
  logAuditEvent(
    eventType,
    AUDIT_LEVELS.CRITICAL,
    message,
    details,
    req
  );
};

module.exports = {
  AUDIT_LEVELS,
  AUDIT_EVENTS,
  logAuditEvent,
  auditMiddleware,
  auditAuth,
  auditExercise,
  auditAdmin,
  logSecurityEvent
};
