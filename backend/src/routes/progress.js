import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import * as ctrl from '../controllers/progressController.js';

const router = Router();
router.use(requireUser);
router.get('/overview', ctrl.overview);
router.get('/skills', ctrl.skills);
export default router;
