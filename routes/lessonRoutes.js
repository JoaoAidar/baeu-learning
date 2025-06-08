const express = require("express");
const router = express.Router();
const LessonController = require("../controllers/LessonController");
const { generalLimiter } = require('../middleware/rateLimiter');

// Route to fetch all lessons
router.get("/", generalLimiter, LessonController.getAllLessons);

// Route to fetch a specific lesson by lessonId
router.get("/:lessonId", generalLimiter, LessonController.getLessonById);

module.exports = router;
