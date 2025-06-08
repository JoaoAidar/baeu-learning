const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { adminAuth } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const { auditAdmin } = require('../middleware/audit');

const adminController = new AdminController();

// Admin routes
router.get('/users/recent', generalLimiter, adminAuth, auditAdmin('view_recent_users'), adminController.getRecentUsers.bind(adminController));
router.get('/stats', generalLimiter, adminAuth, auditAdmin('view_stats'), adminController.getStats.bind(adminController));
router.get('/lessons', generalLimiter, adminAuth, auditAdmin('view_lessons'), adminController.getAdminLessons.bind(adminController));
router.get('/users', generalLimiter, adminAuth, auditAdmin('view_users'), adminController.getAdminUsers.bind(adminController));
router.put('/settings', generalLimiter, adminAuth, auditAdmin('update_settings'), adminController.updateSettings.bind(adminController));
router.get('/lessons-simple', generalLimiter, adminAuth, auditAdmin('view_lessons_simple'), adminController.getAdminLessonsSimple.bind(adminController));

module.exports = router; 