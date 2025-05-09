const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { adminAuth } = require('../middleware/auth');

const adminController = new AdminController();

// Admin routes
router.get('/users/recent', adminAuth, adminController.getRecentUsers.bind(adminController));
router.get('/stats', adminAuth, adminController.getStats.bind(adminController));
router.get('/lessons', adminAuth, adminController.getAdminLessons.bind(adminController));
router.get('/users', adminAuth, adminController.getAdminUsers.bind(adminController));
router.put('/settings', adminAuth, adminController.updateSettings.bind(adminController));
router.get('/lessons-simple', adminAuth, adminController.getAdminLessonsSimple.bind(adminController));

module.exports = router; 