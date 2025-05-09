const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            logger.warn('Authentication failed: no token provided');
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
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

module.exports = {
    auth,
    adminAuth
}; 