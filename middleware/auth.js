const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// TODO: [SECURITY] Add token blacklisting for logged out tokens
// TODO: [SECURITY] Implement token refresh mechanism
// TODO: [SECURITY] Add token expiration time configuration
// TODO: [SECURITY] Consider implementing 2FA for admin routes

const auth = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            logger.warn('Authentication failed: no token provided');
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Standardize user object structure
        req.user = {
            id: decoded.userId || decoded.id,
            userId: decoded.userId || decoded.id, // Backward compatibility
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const adminAuth = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            logger.warn('Admin authentication failed: no token provided');
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            logger.warn('Admin authentication failed: user is not an admin');
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Admin authentication error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// TODO: [SECURITY] Add rate limiting specifically for auth routes
// TODO: [SECURITY] Implement session management
// TODO: [SECURITY] Add audit logging for admin actions

module.exports = {
    auth,
    adminAuth
}; 