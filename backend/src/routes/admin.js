import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import * as ctrl from '../controllers/adminController.js';

const router = Router();
router.use(requireAdmin);
router.post('/exercises/import', ctrl.importExercises);
router.post('/exercises/generate', ctrl.generateExercises);
router.get('/exercises', ctrl.listExercisesAdmin);
router.patch('/exercises/:id/status', ctrl.setExerciseStatus);
router.get('/attempts/recent', ctrl.recentAttempts);
export default router;
