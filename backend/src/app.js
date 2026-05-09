import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import practiceRouter from './routes/practice.js';
import progressRouter from './routes/progress.js';
import modulesRouter from './routes/modules.js';
import lessonsRouter from './routes/lessons.js';
import adminRouter from './routes/admin.js';
import exercisesRouter from './routes/exercises.js';
import { getStore } from './config/db.js';

function buildCorsOptions() {
  const raw = (process.env.CORS_ORIGIN || '').trim();
  if (!raw) return { origin: true, credentials: true };
  const allowed = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return {
    origin(origin, cb) {
      if (!origin) return cb(null, true); // server-to-server / curl
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error('cors_not_allowed'));
    },
    credentials: true,
  };
}

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // Railway terminates TLS at the edge
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/v1/health', (_req, res) => {
    res.json({ ok: true, store: getStore().__mode || 'unknown' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/practice', practiceRouter);
  app.use('/api/v1/progress', progressRouter);
  app.use('/api/v1/modules', modulesRouter);
  app.use('/api/v1/lessons', lessonsRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/exercises', exercisesRouter);

  app.use((req, res) => res.status(404).json({ error: 'not_found', path: req.path }));
  return app;
}
