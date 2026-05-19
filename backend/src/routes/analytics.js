import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import * as Analytics from '../services/AnalyticsService.js';

const router = Router();
router.use(requireUser);

// Learner-facing deep analytics. Personal view only; never returns
// cross-user aggregates here — admin surface is /api/v1/admin/analytics.
router.get('/results', async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    res.json(await Analytics.learnerAnalytics({ userId: req.userId, days }));
  } catch (err) {
    next(err);
  }
});

export default router;
