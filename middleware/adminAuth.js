const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Check if user is admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        // Add user info to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error in admin auth middleware:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
}; 