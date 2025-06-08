import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { ErrorBoundary } from './components/shared';
import Layout from './components/shared/layout/Layout';
import LessonsPage from './pages/LessonsPage';
import LessonPage from './pages/LessonPage';
import ExercisePage from './pages/ExercisePage';
import Profile from './pages/Profile';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import './styles/responsive.css';

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/lessons" element={<LessonsPage />} />
                        <Route path="/lessons/:lessonId" element={<LessonPage />} />
                        <Route path="/lessons/:lessonId/exercise/:exerciseId" element={<ExercisePage />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<Register />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
