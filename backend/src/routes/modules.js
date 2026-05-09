import { Router } from 'express';
import { verifyToken } from '../services/AuthService.js';
import * as ctrl from '../controllers/modulesController.js';

const router = Router();

// Soft auth — populates req.userId if token is present, otherwise lets it through.
router.use((req, _res, next) => {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (payload?.sub) req.userId = payload.sub;
  next();
});

router.get('/', ctrl.list);
router.get('/:slug', ctrl.get);

export default router;
