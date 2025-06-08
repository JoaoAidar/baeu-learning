const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { generalLimiter } = require('../middleware/rateLimiter');

router.get('/', generalLimiter, userController.getAllUsers);
router.get('/:id', generalLimiter, userController.getUserById);
router.post('/create', generalLimiter, userController.createUser);
router.put('/:id', generalLimiter, userController.updateUser);
router.delete('/:id', generalLimiter, userController.deleteUser);

module.exports = router;
