import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom'; // Remove BrowserRouter import

import LessonList from './components/LessonList';
import Exercise from './components/Exercise';
import Result from './components/Result';

export default function App() {
  const [selectedLesson, setSelectedLesson] = useState(null);   // For storing the selected lesson
  const navigate = useNavigate();                               // React Router navigation hook

  // Navigate to Exercise page when a lesson is selected
  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);                                 // Store selected lesson
    navigate(`/exercise/${lesson.id}`);                         // Transition to Exercise scene
  };

  // Scene transitions based on route changes
  return (
    <div>
      <h1>BaeU Learning</h1>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<LessonList onSelect={handleLessonSelect} />} />

        {/* Exercise route, passing selectedLesson as a prop */}
        <Route
          path="/exercise/:lessonId"
          element={<Exercise selectedLesson={selectedLesson} />}
        />

        {/* Results page after exercise completion */}
        <Route path="/result" element={<Result />} />
      </Routes>
    </div>
  );
}
