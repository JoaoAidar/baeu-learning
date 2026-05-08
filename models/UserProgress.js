const supabase = require('../config/db');

class UserProgress {
    static async getProgress(userId) {
        try {
            if (!userId) {
                console.error('No userId provided to getProgress');
                return {};
            }

            // First get all lessons with their exercises
            const { data: lessons, error: lessonsError } = await supabase
                .from('lessons')
                .select(`
                    *,
                    exercises (*)
                `)
                .order('order_index');

            if (lessonsError) {
                console.error('Error fetching lessons:', lessonsError);
                return {};
            }

            // Then get user progress
            const { data: progress, error: progressError } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId);

            if (progressError) {
                console.error('Error fetching progress:', progressError);
                return {};
            }

            // Group progress by lesson
            const progressByLesson = {};
            lessons.forEach(lesson => {
                progressByLesson[lesson.id] = {
                    lesson: {
                        id: lesson.id,
                        title: lesson.title,
                        description: lesson.description,
                        order_index: lesson.order_index
                    },
                    exercises: lesson.exercises.map(exercise => {
                        const exerciseProgress = progress?.find(p => p.exercise_id === exercise.id) || {
                            completed: false,
                            correct: false,
                            attempts: 0,
                            last_attempt_at: null
                        };

                        return {
                            ...exercise,
                            completed: exerciseProgress.completed,
                            correct: exerciseProgress.correct,
                            attempts: exerciseProgress.attempts,
                            lastAttemptAt: exerciseProgress.last_attempt_at
                        };
                    })
                };
            });

            return progressByLesson;
        } catch (error) {
            console.error('Error in getProgress:', error);
            return {};
        }
    }

    static async updateProgress(userId, lessonId, exerciseId, { completed, correct }) {
        try {
            if (!userId || !lessonId || !exerciseId) {
                console.error('Missing required parameters for updateProgress');
                return null;
            }

            const { data, error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: userId,
                    lesson_id: lessonId,
                    exercise_id: exerciseId,
                    completed,
                    correct,
                    attempts: supabase.raw('COALESCE(attempts, 0) + 1'),
                    last_attempt_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,exercise_id'
                })
                .select()
                .single();

            if (error) {
                console.error('Error updating progress:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in updateProgress:', error);
            return null;
        }
    }

    static async getLessonProgress(userId, lessonId) {
        try {
            if (!userId || !lessonId) {
                console.error('Missing required parameters for getLessonProgress');
                return null;
            }

            // Get lesson with exercises
            const { data: lesson, error: lessonError } = await supabase
                .from('lessons')
                .select(`
                    *,
                    exercises (*)
                `)
                .eq('id', lessonId)
                .single();

            if (lessonError) {
                console.error('Error fetching lesson:', lessonError);
                return null;
            }

            // Get user progress for this lesson
            const { data: progress, error: progressError } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('lesson_id', lessonId);

            if (progressError) {
                console.error('Error fetching progress:', progressError);
                return null;
            }

            return {
                lesson: {
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    order_index: lesson.order_index
                },
                exercises: lesson.exercises.map(exercise => {
                    const exerciseProgress = progress?.find(p => p.exercise_id === exercise.id) || {
                        completed: false,
                        correct: false,
                        attempts: 0,
                        last_attempt_at: null
                    };

                    return {
                        ...exercise,
                        completed: exerciseProgress.completed,
                        correct: exerciseProgress.correct,
                        attempts: exerciseProgress.attempts,
                        lastAttemptAt: exerciseProgress.last_attempt_at
                    };
                })
            };
        } catch (error) {
            console.error('Error in getLessonProgress:', error);
            return null;
        }
    }
}

module.exports = UserProgress; 