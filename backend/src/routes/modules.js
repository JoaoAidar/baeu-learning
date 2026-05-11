import { Router } from 'express';
import { maybeUser } from '../middleware/auth.js';
import * as ctrl from '../controllers/modulesController.js';

const router = Router();

// Soft auth — populates req.userId if a Better Auth session cookie is present.
router.use(maybeUser);

router.get('/', ctrl.list);
router.get('/:slug', ctrl.get);

export default router;
