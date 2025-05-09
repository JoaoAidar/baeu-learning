const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

class AdminController {
    async getRecentUsers(req, res) {
        try {
            const { data: users, error } = await supabase
                .from('users')
                .select('id, username, email, role, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                logger.error('Error fetching recent users:', error);
                return res.status(500).json({ error: 'Failed to fetch recent users' });
            }

            res.json(users);
        } catch (error) {
            logger.error('Get recent users error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getStats(req, res) {
        try {
            // Get total users count
            const { count: totalUsers, error: usersError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            if (usersError) {
                logger.error('Error fetching total users:', usersError);
                return res.status(500).json({ error: 'Failed to fetch user stats' });
            }

            // Get total lessons count
            const { count: totalLessons, error: lessonsError } = await supabase
                .from('lessons')
                .select('*', { count: 'exact', head: true });

            if (lessonsError) {
                logger.error('Error fetching total lessons:', lessonsError);
                return res.status(500).json({ error: 'Failed to fetch lesson stats' });
            }

            // Get total exercises count
            const { count: totalExercises, error: exercisesError } = await supabase
                .from('exercises')
                .select('*', { count: 'exact', head: true });

            if (exercisesError) {
                logger.error('Error fetching total exercises:', exercisesError);
                return res.status(500).json({ error: 'Failed to fetch exercise stats' });
            }

            // Get total progress entries
            const { count: totalProgress, error: progressError } = await supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true });

            if (progressError) {
                logger.error('Error fetching total progress:', progressError);
                return res.status(500).json({ error: 'Failed to fetch progress stats' });
            }

            res.json({
                totalUsers,
                totalLessons,
                totalExercises,
                totalProgress
            });
        } catch (error) {
            logger.error('Get stats error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAdminLessons(req, res) {
        try {
            const { data: lessons, error } = await supabase
                .from('lessons')
                .select(`
                    id,
                    title,
                    description,
                    order_index,
                    created_at,
                    updated_at,
                    exercises (
                        id,
                        type,
                        difficulty,
                        prompt,
                        options,
                        correct_answer,
                        explanation,
                        created_at,
                        updated_at
                    )
                `)
                .order('order_index', { ascending: true });

            if (error) {
                logger.error('Error fetching lessons:', error);
                return res.status(500).json({ error: 'Failed to fetch lessons' });
            }

            res.json(lessons);
        } catch (error) {
            logger.error('Get admin lessons error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAdminLessonsSimple(req, res) {
        try {
            const { data: lessons, error } = await supabase
                .from('lessons')
                .select('id, title, description, order_index')
                .order('order_index', { ascending: true });

            if (error) {
                logger.error('Error fetching simple lessons:', error);
                return res.status(500).json({ error: 'Failed to fetch lessons' });
            }

            res.json(lessons);
        } catch (error) {
            logger.error('Get admin simple lessons error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAdminUsers(req, res) {
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
            logger.error('Get admin users error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateSettings(req, res) {
        try {
            const { settings } = req.body;
            
            // Update settings in the database
            const { data, error } = await supabase
                .from('settings')
                .upsert(settings)
                .select();

            if (error) {
                logger.error('Error updating settings:', error);
                return res.status(500).json({ error: 'Failed to update settings' });
            }

            res.json(data);
        } catch (error) {
            logger.error('Update settings error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = AdminController; 