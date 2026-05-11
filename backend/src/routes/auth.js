import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import { rateLimit, authRateLimit } from '../middleware/rateLimit.js';
import * as ctrl from '../controllers/authController.js';

const router = Router();

// login: ip+email — blocks brute force against a target account
const loginLimit = authRateLimit({
  prefix: 'login',
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 10,
  windowMs: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || 15 * 60 * 1000,
});
// signup: pure IP — blocks one IP from creating many accounts
const signupLimit = rateLimit({
  prefix: 'signup',
  max: Number(process.env.RATE_LIMIT_SIGNUP_MAX) || 5,
  windowMs: Number(process.env.RATE_LIMIT_SIGNUP_WINDOW_MS) || 60 * 60 * 1000,
});

router.post('/signup', signupLimit, ctrl.signup);
router.post('/login', loginLimit, ctrl.login);
router.get('/me', requireUser, ctrl.me);
router.delete('/me', requireUser, ctrl.deleteMe);
router.post('/logout-all', requireUser, ctrl.logoutAll);
export default router;
