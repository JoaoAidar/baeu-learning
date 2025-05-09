const Exercise = require('../models/exerciseModel');

class ExerciseServer {
    static DIFFICULTY_LEVELS = {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    };

    static EXERCISE_TYPES = {
        MULTIPLE_CHOICE: 'multiple_choice',
        TEXT: 'text',
        MATCHING: 'matching',
        LISTENING: 'listening',
        SPEAKING: 'speaking'
    };

    constructor() {
        this.difficultyWeights = {
            [ExerciseServer.DIFFICULTY_LEVELS.EASY]: 1,
            [ExerciseServer.DIFFICULTY_LEVELS.MEDIUM]: 2,
            [ExerciseServer.DIFFICULTY_LEVELS.HARD]: 3
        };
    }

    /**
     * Get exercises for a lesson with variety and difficulty progression
     * @param {string} lessonId - The lesson ID
     * @param {Object} userProgress - User's progress data
     * @returns {Promise<Array>} Array of exercises
     */
    async getExercisesForLesson(lessonId, userProgress) {
        try {
            // Get all exercises for the lesson
            const allExercises = await Exercise.findByLessonId(lessonId);
            
            // Calculate user's skill level based on progress
            const skillLevel = this.calculateSkillLevel(userProgress);
            
            // Group exercises by type
            const exercisesByType = this.groupExercisesByType(allExercises);
            
            // Select exercises based on variety and difficulty
            const selectedExercises = this.selectExercises(exercisesByType, skillLevel);
            
            // Shuffle the exercises
            return this.shuffleArray(selectedExercises);
        } catch (error) {
            console.error('Error in getExercisesForLesson:', error);
            throw error;
        }
    }

    /**
     * Calculate user's skill level based on their progress
     * @param {Object} userProgress - User's progress data
     * @returns {number} Skill level (0-1)
     */
    calculateSkillLevel(userProgress) {
        if (!userProgress || !userProgress.completedExercises) {
            return 0;
        }

        const totalExercises = userProgress.totalExercises || 0;
        const completedExercises = userProgress.completedExercises || 0;
        const correctAnswers = userProgress.correctAnswers || 0;

        if (totalExercises === 0) return 0;

        const completionRate = completedExercises / totalExercises;
        const accuracyRate = correctAnswers / completedExercises;

        return (completionRate + accuracyRate) / 2;
    }

    /**
     * Group exercises by their type
     * @param {Array} exercises - Array of exercises
     * @returns {Object} Exercises grouped by type
     */
    groupExercisesByType(exercises) {
        return exercises.reduce((acc, exercise) => {
            if (!acc[exercise.type]) {
                acc[exercise.type] = [];
            }
            acc[exercise.type].push(exercise);
            return acc;
        }, {});
    }

    /**
     * Select exercises based on variety and difficulty
     * @param {Object} exercisesByType - Exercises grouped by type
     * @param {number} skillLevel - User's skill level
     * @returns {Array} Selected exercises
     */
    selectExercises(exercisesByType, skillLevel) {
        const selectedExercises = [];
        const types = Object.keys(exercisesByType);
        
        // Ensure we have at least one exercise of each type
        types.forEach(type => {
            const typeExercises = exercisesByType[type];
            if (typeExercises.length > 0) {
                // Select exercises based on difficulty
                const difficulty = this.getDifficultyForSkillLevel(skillLevel);
                const filteredExercises = typeExercises.filter(ex => 
                    ex.difficulty === difficulty || 
                    (difficulty === ExerciseServer.DIFFICULTY_LEVELS.MEDIUM && 
                     ex.difficulty === ExerciseServer.DIFFICULTY_LEVELS.EASY)
                );
                
                if (filteredExercises.length > 0) {
                    selectedExercises.push(
                        filteredExercises[Math.floor(Math.random() * filteredExercises.length)]
                    );
                }
            }
        });

        return selectedExercises;
    }

    /**
     * Get appropriate difficulty level based on skill level
     * @param {number} skillLevel - User's skill level (0-1)
     * @returns {string} Difficulty level
     */
    getDifficultyForSkillLevel(skillLevel) {
        if (skillLevel < 0.3) {
            return ExerciseServer.DIFFICULTY_LEVELS.EASY;
        } else if (skillLevel < 0.7) {
            return ExerciseServer.DIFFICULTY_LEVELS.MEDIUM;
        } else {
            return ExerciseServer.DIFFICULTY_LEVELS.HARD;
        }
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}

module.exports = ExerciseServer; 