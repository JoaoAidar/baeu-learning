const express = require("express");
const router = express.Router();
const LessonController = require("../controllers/LessonController");

// Route to fetch all lessons
router.get("/", LessonController.getAllLessons);

// Route to fetch a specific lesson by lessonId
router.get("/:lessonId", LessonController.getLessonById);

module.exports = router;
