import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
  const isProd = process.env.NODE_ENV === 'production';
  if (!raw) {
    if (isProd) {
      // Fail-closed: production must declare explicit origins.
      throw new Error(
        'CORS_ORIGIN must be set in production (comma-separated origins). ' +
          'Refusing to start with permissive CORS.'
      );
    }
    return { origin: true, credentials: true };
  }
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

  // Security headers. HSTS on by default in helmet; CSP is intentionally
  // left off here — a strict, route-aware CSP comes in a later commit.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

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

  // Global error handler — last line of defense. Never leak err.message for
  // unknown errors. Pass through only deliberate codes (err.code) or errors
  // marked safe-to-expose (err.expose === true).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    const status = Number(err?.status) || 500;
    console.error(
      `[baeu] error ${status} ${req.method} ${req.originalUrl || req.path}:`,
      err && err.stack ? err.stack : err
    );
    let code = 'internal_error';
    if (typeof err?.code === 'string' && err.code) {
      code = err.code;
    } else if (err?.expose === true && typeof err.message === 'string' && err.message) {
      code = err.message;
    } else if (status >= 400 && status < 500 && typeof err?.message === 'string' && err.message) {
      // Client errors with a short message string are safe to surface.
      code = err.message;
    }
    if (res.headersSent) return;
    res.status(status).json({ error: code });
  });

  return app;
}
