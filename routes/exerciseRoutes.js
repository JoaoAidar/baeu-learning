const express = require('express');
const router = express.Router();
const ExerciseController = require('../controllers/ExerciseController');

// Get exercises for a lesson
router.get('/lesson/:lessonId', ExerciseController.getExercisesByLessonId);

// Get exercises by type
router.get('/lesson/:lessonId/type/:type', ExerciseController.getExercisesByType);

// Submit exercise answer
router.post('/:exerciseId/submit', ExerciseController.submitExerciseAnswer);

// Create new exercise
router.post('/', ExerciseController.createExercise);

// Update exercise
router.put('/:exerciseId', ExerciseController.updateExercise);

// Delete exercise
router.delete('/:exerciseId', ExerciseController.deleteExercise);

// Get a single exercise by ID
router.get('/:exerciseId', ExerciseController.getExerciseById);

module.exports = router;
