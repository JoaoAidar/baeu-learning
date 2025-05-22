import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LessonsPage from './pages/LessonsPage';
import LessonPage from './pages/LessonPage';
import ExercisePage from './pages/ExercisePage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/lessons" element={<LessonsPage />} />
                    <Route path="/lessons/:lessonId" element={<LessonPage />} />
                    <Route path="/lessons/:lessonId/exercise/:exerciseId" element={<ExercisePage />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
