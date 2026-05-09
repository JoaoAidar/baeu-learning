import { Router } from 'express';
import * as ctrl from '../controllers/lessonsController.js';

const router = Router();
router.get('/', ctrl.list);
router.get('/:slug', ctrl.get);
export default router;
