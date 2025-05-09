const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { auth } = require('./middleware/auth');
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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(auth);

// TODO: [ARCHITECTURE] Consider implementing API versioning
// TODO: [ARCHITECTURE] Add request validation middleware
// TODO: [ARCHITECTURE] Consider implementing API documentation (e.g., Swagger)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// TODO: [ERROR HANDLING] Implement more specific error types and handlers
// TODO: [ERROR HANDLING] Add request ID tracking for better debugging
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app; 