const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/ExerciseController');

// Retorna todos os exercícios de uma lição no novo formato JSON modular
router.get('/lesson/:lessonId', exerciseController.getExercisesByLessonId);

// Submete resposta do usuário e retorna feedback
router.post('/:exerciseId/submit', exerciseController.submitAnswer);

module.exports = router;
