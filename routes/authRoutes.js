const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { validateLogin, validateProgress } = require('../middleware/validators');
const { auth, adminAuth } = require('../middleware/auth');

const authController = new AuthController();

// Public routes
router.post('/login', validateLogin, authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/me', auth, authController.getCurrentUser.bind(authController));
router.post('/progress', auth, validateProgress, authController.updateProgress.bind(authController));
router.get('/progress', auth, authController.getProgress.bind(authController));
router.get('/progress/:lessonId', auth, authController.getLessonProgress.bind(authController));

// Admin routes
router.get('/admin/users', adminAuth, authController.getAllUsers.bind(authController));
router.patch('/admin/users/:userId/role', adminAuth, authController.updateUserRole.bind(authController));

module.exports = router; 