const supabase = require('../config/db');

class Exercise {
    static async findById(id) {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Ensure options is properly formatted
        if (data) {
            let options = data.options;
            if (typeof options === 'string') {
                try {
                    options = JSON.parse(options);
                } catch (e) {
                    console.error('Failed to parse options:', e);
                    options = [];
                }
            }

            // If options is an object, convert it to array format
            if (options && typeof options === 'object' && !Array.isArray(options)) {
                options = Object.entries(options).map(([id, text]) => ({
                    id,
                    text: String(text)
                }));
            }

            // Ensure options is an array
            if (!Array.isArray(options)) {
                console.error('Invalid options format:', options);
                options = [];
            }

            data.options = options;
        }

        return data;
    }

    static async findByLessonId(lessonId) {
        try {
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('order_index');

            if (error) {
                console.error('Supabase error in findByLessonId:', error);
                throw error;
            }

            if (!data) {
                console.log('No exercises found for lesson:', lessonId);
                return [];
            }

            // Process options for each exercise
            return data.map(exercise => {
                let options = exercise.options;
                if (typeof options === 'string') {
                    try {
                        options = JSON.parse(options);
                    } catch (e) {
                        console.error('Failed to parse options:', e);
                        options = [];
                    }
                }

                if (options && typeof options === 'object' && !Array.isArray(options)) {
                    options = Object.entries(options).map(([id, text]) => ({
                        id,
                        text: String(text)
                    }));
                }

                if (!Array.isArray(options)) {
                    options = [];
                }

                return {
                    ...exercise,
                    options
                };
            });
        } catch (error) {
            console.error('Error in findByLessonId:', error);
            throw error;
        }
    }

    static async findByType(lessonId, type) {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('lesson_id', lessonId)
            .eq('type', type)
            .order('order_index');

        if (error) throw error;
        return data;
    }

    static async create(exerciseData) {
        const { 
            lesson_id, 
            type, 
            difficulty,
            prompt, 
            options, 
            correct_answer, 
            explanation, 
            order_index 
        } = exerciseData;

        const { data, error } = await supabase
            .from('exercises')
            .insert([{
                lesson_id,
                type,
                difficulty,
                prompt,
                options,
                correct_answer,
                explanation,
                order_index
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async update(id, exerciseData) {
        const { type, prompt, options, correct_answer, explanation, order_index } = exerciseData;
        const { data, error } = await supabase
            .from('exercises')
            .update({
                type,
                prompt,
                options,
                correct_answer,
                explanation,
                order_index,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async delete(id) {
        const { data, error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async submitAnswer(userId, exerciseId, userAnswer) {
        const exercise = await this.findById(exerciseId);
        if (!exercise) {
            throw new Error('Exercise not found');
        }

        const isCorrect = userAnswer.trim() === exercise.correct_answer.trim();
        
        const { data, error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                exercise_id: exerciseId,
                user_answer: userAnswer,
                is_correct: isCorrect,
                completed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            correct_answer: exercise.correct_answer,
            explanation: exercise.explanation
        };
    }

    static async getUserProgress(userId, lessonId) {
        // First get all exercises for the lesson
        const exercises = await this.findByLessonId(lessonId);
        const exerciseIds = exercises.map(ex => ex.id);

        // Then get progress for these exercises
        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .in('exercise_id', exerciseIds);

        if (error) throw error;

        // Calculate progress metrics
        const totalExercises = exercises.length;
        const completedExercises = data.filter(progress => progress.completed).length;
        const correctAnswers = data.filter(progress => progress.is_correct).length;

        return {
            totalExercises,
            completedExercises,
            correctAnswers,
            progress: data
        };
    }

    static async updateUserProgress(userId, exerciseId, progressData) {
        const { data, error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                exercise_id: exerciseId,
                completed: progressData.completed,
                is_correct: progressData.correct,
                attempts: progressData.attempts,
                last_attempt_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async countExercisesByLesson(lessonId) {
        const { count, error } = await supabase
            .from('exercises')
            .select('*', { count: 'exact', head: true })
            .eq('lesson_id', lessonId);

        if (error) throw error;
        return count;
    }
}

module.exports = Exercise; 