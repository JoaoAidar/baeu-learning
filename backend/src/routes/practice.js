import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import * as ctrl from '../controllers/practiceController.js';

const router = Router();
router.use(requireUser);
router.post('/sessions', ctrl.startSession);
router.get('/next', ctrl.nextQuestion);
router.post('/answer', ctrl.submitAnswer);
router.get('/sessions/:id/summary', ctrl.sessionSummary);
export default router;
