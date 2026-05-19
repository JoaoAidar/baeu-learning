import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import * as ctrl from '../controllers/adminController.js';

const router = Router();
router.use(requireAdmin);

const llmLimit = rateLimit({
  prefix: 'llm-gen',
  max: Number(process.env.RATE_LIMIT_LLM_MAX) || 20,
  windowMs: Number(process.env.RATE_LIMIT_LLM_WINDOW_MS) || 60 * 60 * 1000,
});

router.post('/exercises/import', ctrl.importExercises);
router.post('/exercises/generate', llmLimit, ctrl.generateExercises);
router.get('/exercises', ctrl.listExercisesAdmin);
router.patch('/exercises/:id/status', ctrl.setExerciseStatus);
router.get('/attempts/recent', ctrl.recentAttempts);
router.get('/metrics', ctrl.metrics);
router.get('/analytics', ctrl.analytics);
export default router;
