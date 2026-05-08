const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { isAdmin } = require('../middleware/auth');

// Apply admin middleware to all routes
router.use(isAdmin);

// Get admin dashboard statistics
router.get('/stats', AdminController.getStats);

// Get recent activity
router.get('/activity', AdminController.getRecentActivity);

module.exports = router; 