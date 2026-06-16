import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import * as ctrl from '../controllers/chatController.js';

const router = Router();
router.use(requireUser);
router.get('/personas', ctrl.listPersonas);
router.post('/conversations', ctrl.start);
router.post('/conversations/:id/reply', ctrl.reply);
router.post('/conversations/:id/end', ctrl.end);
router.get('/conversations/:id', ctrl.get);
export default router;
