const logger = require('../utils/logger');

const validateLogin = (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        logger.warn('Login validation failed: missing credentials');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
        logger.warn('Login validation failed: invalid credential types');
        return res.status(400).json({ error: 'Invalid credential format' });
    }

    if (username.length < 3 || username.length > 50) {
        logger.warn('Login validation failed: username length invalid');
        return res.status(400).json({ error: 'Username must be between 3 and 50 characters' });
    }

    if (password.length < 6) {
        logger.warn('Login validation failed: password too short');
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    next();
};

const validateProgress = (req, res, next) => {
    const { lessonId, exerciseId, completed, correct } = req.body;

    if (!lessonId || !exerciseId) {
        logger.warn('Progress validation failed: missing required fields');
        return res.status(400).json({ error: 'Lesson ID and Exercise ID are required' });
    }

    if (typeof completed !== 'boolean') {
        logger.warn('Progress validation failed: invalid completed type');
        return res.status(400).json({ error: 'Completed must be a boolean' });
    }

    if (typeof correct !== 'boolean') {
        logger.warn('Progress validation failed: invalid correct type');
        return res.status(400).json({ error: 'Correct must be a boolean' });
    }

    next();
};

module.exports = {
    validateLogin,
    validateProgress
}; 