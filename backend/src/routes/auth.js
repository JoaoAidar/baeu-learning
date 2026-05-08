import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import * as ctrl from '../controllers/authController.js';

const router = Router();
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.get('/me', requireUser, ctrl.me);
export default router;
