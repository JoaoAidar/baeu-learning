import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import { getStore } from '../config/db.js';

const router = Router();

// Lightweight per-session role lookup. The frontend calls this after
// authClient.useSession resolves, so it can decide whether to render the
// Admin link. Returns the role from user_role (default 'user'), the
// user id, and email.
router.get('/role', requireUser, async (req, res, next) => {
  try {
    const store = getStore();
    const role =
      typeof store.getUserRole === 'function'
        ? await store.getUserRole(req.userId)
        : 'user';
    res.json({ id: req.userId, email: req.userEmail, role: role || 'user' });
  } catch (err) {
    next(err);
  }
});

export default router;
