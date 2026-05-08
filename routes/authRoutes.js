const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { validateLogin, validateProgress } = require('../middleware/validators');
const { auth, adminAuth } = require('../middleware/auth');
const { authLimiter, generalLimiter } = require('../middleware/rateLimiter');
const { auditAuth, AUDIT_EVENTS } = require('../middleware/audit');

// Rate limiting implemented ✅
// TODO: [SECURITY] Add password complexity validation
// TODO: [SECURITY] Add account lockout after failed attempts

const authController = new AuthController();

// Public routes with strict rate limiting
router.post('/login', authLimiter, validateLogin, auditAuth(AUDIT_EVENTS.USER_LOGIN), authController.login.bind(authController));
router.post('/logout', generalLimiter, auditAuth(AUDIT_EVENTS.USER_LOGOUT), authController.logout.bind(authController));
router.post('/signup', authLimiter, authController.createUser.bind(authController));
// TODO: [SECURITY] Add session invalidation on logout
// TODO: [SECURITY] Add token revocation mechanism

// Protected routes
router.get('/me', generalLimiter, auth, authController.getCurrentUser.bind(authController));
router.post('/progress', auth, validateProgress, authController.updateProgress.bind(authController));
router.get('/progress', auth, authController.getProgress.bind(authController));
router.get('/progress/:lessonId', auth, authController.getLessonProgress.bind(authController));

// TODO: [VALIDATION] Add input sanitization for all routes
// TODO: [VALIDATION] Add proper error handling for invalid inputs

// Admin routes
router.get('/admin/users', adminAuth, authController.getAllUsers.bind(authController));
router.patch('/admin/users/:userId/role', adminAuth, authController.updateUserRole.bind(authController));

// TODO: [AUDIT] Add logging for admin actions
// TODO: [AUDIT] Add audit trail for role changes

module.exports = router; 