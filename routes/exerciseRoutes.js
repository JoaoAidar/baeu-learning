const express = require('express');
const router = express.Router();
const ExerciseController = require('../controllers/ExerciseController');
const { auth } = require('../middleware/auth');
const { validateProgress } = require('../middleware/validators');
const { exerciseLimiter } = require('../middleware/rateLimiter');
const { auditExercise } = require('../middleware/audit');

// Get exercises for a lesson (public)
router.get('/lesson/:lessonId', ExerciseController.getExercisesByLessonId);

// Get exercises by type (requires auth)
router.get('/lesson/:lessonId/type/:type', auth, ExerciseController.getExercisesByType);

// Submit exercise answer (requires auth and validation)
router.post('/:exerciseId/submit', exerciseLimiter, auth, validateProgress, auditExercise, ExerciseController.submitExerciseAnswer);

// Create new exercise (admin only)
router.post('/', auth, ExerciseController.createExercise);

// Update exercise (admin only)
router.put('/:exerciseId', auth, ExerciseController.updateExercise);

// Delete exercise (admin only)
router.delete('/:exerciseId', auth, ExerciseController.deleteExercise);

// Get a single exercise by ID
router.get('/:exerciseId', ExerciseController.getExerciseById);

module.exports = router;
