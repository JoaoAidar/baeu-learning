import { Router } from 'express';
import * as ctrl from '../controllers/adminController.js';

const router = Router();
router.get('/', ctrl.listExercises);
export default router;
