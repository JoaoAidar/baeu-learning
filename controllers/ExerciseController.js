const Exercise = require('../models/exerciseModel');
const Lesson = require('../models/lessonModel');
const ExerciseServer = require('../services/ExerciseServer');

class ExerciseController {
    static async getExercisesByLessonId(req, res) {
        try {
            const lessonId = req.params.lessonId;
            
            // Verify lesson exists
            const lesson = await Lesson.findById(lessonId);
            if (!lesson) {
                return res.status(404).json({ error: 'Lesson not found' });
            }

            // Get exercises directly without user progress for now
            const exercises = await Exercise.findByLessonId(lessonId);
            
            res.json({
                lesson_id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                exercises: exercises.map(ex => ({
                    exercise_id: ex.id,
                    type: ex.type,
                    difficulty: ex.difficulty,
                    question: ex.prompt,
                    options: ex.options,
                    correct_answer: ex.correct_answer,
                    explanation: ex.explanation
                }))
            });        } catch (error) {
            console.error('Error in getExercisesByLessonId:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getExercisesByType(req, res) {
        try {
            const { lessonId, type } = req.params;
            const userId = req.user?.id;
            
            // Get user progress
            const userProgress = await Exercise.getUserProgress(userId, lessonId);
            
            // Use ExerciseServer to get varied exercises
            const exerciseServer = new ExerciseServer();
            const exercises = await exerciseServer.getExercisesForLesson(lessonId, userProgress);
            
            // Filter by type
            const filteredExercises = exercises.filter(ex => ex.type === type);
            
            res.json(filteredExercises);
        } catch (error) {
            console.error('Error in getExercisesByType:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async submitExerciseAnswer(req, res) {
        try {
            const { exerciseId } = req.params;
            const { answer, lessonId } = req.body;
            const userId = req.user?.id || req.user?.userId;

            // Validate required fields
            if (!userId) {
                return res.status(401).json({ error: 'User authentication required' });
            }

            if (!answer || answer.toString().trim() === '') {
                return res.status(400).json({ error: 'Answer is required' });
            }

            // Get exercise
            const exercise = await Exercise.findById(exerciseId);
            if (!exercise) {
                return res.status(404).json({ error: 'Exercise not found' });
            }

            let isCorrect = false;
            // Handle different types of answers with proper sanitization
            if (typeof answer === 'string' && typeof exercise.correct_answer === 'string') {
                const sanitizedAnswer = answer.trim().toLowerCase();
                const sanitizedCorrect = exercise.correct_answer.trim().toLowerCase();
                isCorrect = sanitizedAnswer === sanitizedCorrect;
            } else if (typeof answer === 'object' && typeof exercise.correct_answer === 'string') {
                // For matching or other structured answers, compare as JSON
                try {
                    isCorrect = JSON.stringify(answer) === exercise.correct_answer;
                } catch (e) {
                    console.error('Error comparing structured answer:', e);
                    isCorrect = false;
                }
            } else {
                isCorrect = answer === exercise.correct_answer;
            }

            // Save user progress
            const UserProgress = require('../models/UserProgress');
            const progressData = await UserProgress.updateProgress(
                userId, 
                lessonId || exercise.lesson_id, 
                exerciseId, 
                { 
                    completed: true, 
                    correct: isCorrect 
                }
            );

            if (!progressData) {
                console.warn('Failed to save progress for user:', userId, 'exercise:', exerciseId);
            }

            // Return the result with progress saved
            res.json({
                correct: isCorrect,
                explanation: exercise.explanation,
                progressSaved: !!progressData
            });
        } catch (error) {
            console.error('Error in submitExerciseAnswer:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async createExercise(req, res) {
        try {
            const exercise = await Exercise.create(req.body);
            res.status(201).json(exercise);
        } catch (error) {
            console.error('Error in createExercise:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateExercise(req, res) {
        try {
            const exercise = await Exercise.update(req.params.exerciseId, req.body);
            if (!exercise) {
                return res.status(404).json({ error: 'Exercise not found' });
            }
            res.json(exercise);
        } catch (error) {
            console.error('Error in updateExercise:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async deleteExercise(req, res) {
        try {
            const exercise = await Exercise.delete(req.params.exerciseId);
            if (!exercise) {
                return res.status(404).json({ error: 'Exercise not found' });
            }
            res.json({ message: 'Exercise deleted successfully' });
        } catch (error) {
            console.error('Error in deleteExercise:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getExerciseById(req, res) {
        try {
            const { exerciseId } = req.params;
            const exercise = await Exercise.findById(exerciseId);
            if (!exercise) {
                return res.status(404).json({ error: 'Exercise not found' });
            }

            // Ensure options is properly formatted
            let options = exercise.options;
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

            res.json({
                id: exercise.id,
                type: exercise.type,
                difficulty: exercise.difficulty,
                prompt: exercise.prompt,
                options: options,
                correct_answer: exercise.correct_answer,
                explanation: exercise.explanation
            });
        } catch (error) {
            console.error('Error in getExerciseById:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = ExerciseController;
  
  
