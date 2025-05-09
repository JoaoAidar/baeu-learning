const Lesson = require('../models/lessonModel');
const supabase = require('../config/db');

class LessonController {
    static async getLessonById(req, res) {
        try {
            const lesson = await Lesson.findById(req.params.lessonId);
            if (!lesson) {
                return res.status(404).json({ error: 'Lesson not found' });
            }
            res.json(lesson);
        } catch (error) {
            console.error('Error in getLessonById:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getAllLessons(req, res) {
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
                        order_index
                    )
                `)
                .order('order_index', { ascending: true });

            if (error) {
                console.error('Error in getAllLessons:', error);
                return res.status(500).json({ error: 'Failed to fetch lessons' });
            }

            res.json(lessons);
        } catch (error) {
            console.error('Error in getAllLessons:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async createLesson(req, res) {
        try {
            const lesson = await Lesson.create(req.body);
            res.status(201).json(lesson);
        } catch (error) {
            console.error('Error in createLesson:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateLesson(req, res) {
        try {
            const lesson = await Lesson.update(req.params.lessonId, req.body);
            if (!lesson) {
                return res.status(404).json({ error: 'Lesson not found' });
            }
            res.json(lesson);
        } catch (error) {
            console.error('Error in updateLesson:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async deleteLesson(req, res) {
        try {
            const lesson = await Lesson.delete(req.params.lessonId);
            if (!lesson) {
                return res.status(404).json({ error: 'Lesson not found' });
            }
            res.json({ message: 'Lesson deleted successfully' });
        } catch (error) {
            console.error('Error in deleteLesson:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = LessonController;
