const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            logger.info(`Login attempt for user: ${username}`);

            // Log the request body for debugging
            logger.debug('Login request body:', { username, passwordLength: password?.length });

            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error) {
                logger.error('Supabase error:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                logger.warn(`Login failed: User not found - ${username}`);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Log the user data for debugging (excluding password)
            logger.debug('User found:', { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                hasPassword: !!user.password_hash 
            });

            // Check if password_hash exists
            if (!user.password_hash) {
                logger.error('User has no password hash:', username);
                return res.status(500).json({ error: 'User account error' });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                logger.warn(`Login failed: Invalid password for user - ${username}`);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { 
                    userId: user.id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            logger.info(`Login successful for user: ${username}`);
            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie('token');
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            logger.error('Logout error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getCurrentUser(req, res) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('id, username, email, role')
                .eq('id', req.user.userId)
                .single();

            if (error || !user) {
                logger.error('Error fetching current user:', error);
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            });
        } catch (error) {
            logger.error('Get current user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateProgress(req, res) {
        try {
            const { lessonId, exerciseId, completed, correct } = req.body;
            const userId = req.user.userId;

            const { data, error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: userId,
                    lesson_id: lessonId,
                    exercise_id: exerciseId,
                    completed,
                    correct,
                    updated_at: new Date()
                });

            if (error) {
                logger.error('Error updating progress:', error);
                return res.status(500).json({ error: 'Failed to update progress' });
            }

            res.json({ message: 'Progress updated successfully' });
        } catch (error) {
            logger.error('Update progress error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getProgress(req, res) {
        try {
            const userId = req.user.userId;

            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                logger.error('Error fetching progress:', error);
                return res.status(500).json({ error: 'Failed to fetch progress' });
            }

            res.json(data);
        } catch (error) {
            logger.error('Get progress error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getLessonProgress(req, res) {
        try {
            const userId = req.user.userId;
            const { lessonId } = req.params;

            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('lesson_id', lessonId);

            if (error) {
                logger.error('Error fetching lesson progress:', error);
                return res.status(500).json({ error: 'Failed to fetch lesson progress' });
            }

            res.json(data);
        } catch (error) {
            logger.error('Get lesson progress error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAllUsers(req, res) {
        try {
            const { data: users, error } = await supabase
                .from('users')
                .select('id, username, email, role, created_at')
                .order('created_at', { ascending: false });

            if (error) {
                logger.error('Error fetching users:', error);
                return res.status(500).json({ error: 'Failed to fetch users' });
            }

            res.json(users);
        } catch (error) {
            logger.error('Get all users error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateUserRole(req, res) {
        try {
            const { userId } = req.params;
            const { role } = req.body;

            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }

            const { data, error } = await supabase
                .from('users')
                .update({ role })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                logger.error('Error updating user role:', error);
                return res.status(500).json({ error: 'Failed to update user role' });
            }

            res.json(data);
        } catch (error) {
            logger.error('Update user role error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = AuthController; 