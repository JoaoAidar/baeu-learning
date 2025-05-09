const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { auth } = require('./middleware/auth');
const { securityHeaders, apiLimiter } = require('./middleware/security');
const authRoutes = require('./routes/auth');
const lessonRoutes = require('./routes/lessons');
const exerciseRoutes = require('./routes/exercises');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const { logger } = require('./utils/logger');

const app = express();

// TODO: [SECURITY] Consider implementing rate limiting to prevent brute force attacks
// TODO: [SECURITY] Add helmet.js for additional security headers
// TODO: [SECURITY] Consider implementing request size limits

// Security middleware
app.use(securityHeaders);
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(auth);

// TODO: [ARCHITECTURE] Consider implementing API versioning
// TODO: [ARCHITECTURE] Add request validation middleware
// TODO: [ARCHITECTURE] Consider implementing API documentation (e.g., Swagger)

// API versioning
const API_VERSION = 'v1';
const apiBase = `/api/${API_VERSION}`;

// Apply rate limiting to all routes
app.use(apiBase, apiLimiter);

// Routes
app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/lessons`, lessonRoutes);
app.use(`${apiBase}/exercises`, exerciseRoutes);
app.use(`${apiBase}/users`, userRoutes);
app.use(`${apiBase}/admin`, adminRoutes);

// Request ID tracking
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substring(7);
  next();
});

// TODO: [ERROR HANDLING] Implement more specific error types and handlers
// TODO: [ERROR HANDLING] Add request ID tracking for better debugging
app.use((err, req, res, next) => {
  const errorId = req.id;
  logger.error(`[${errorId}] Unhandled error:`, err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: err.message,
      errorId 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized',
      details: err.message,
      errorId 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    errorId 
  });
});

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith(apiBase)) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).send('Not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app; 