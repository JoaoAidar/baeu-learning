import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './utils/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LessonsPage from './pages/LessonsPage';
import LessonPage from './pages/LessonPage';
import ExercisePage from './pages/ExercisePage';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import Overview from './pages/admin/Overview';
import Users from './pages/admin/Users';
import Lessons from './pages/admin/Lessons';
import Settings from './pages/admin/Settings';

const PrivateRoute = ({ children, requireAdmin = false }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && user?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <ErrorBoundary>
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/lessons"
                                element={
                                    <PrivateRoute>
                                        <LessonsPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/lessons/:lessonId"
                                element={
                                    <PrivateRoute>
                                        <LessonPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/lesson/:lessonId/exercise/:exerciseId"
                                element={
                                    <PrivateRoute>
                                        <ExercisePage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/exercises/:exerciseId"
                                element={
                                    <PrivateRoute>
                                        <ExercisePage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <PrivateRoute>
                                        <Profile />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin/*"
                                element={
                                    <PrivateRoute requireAdmin>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            >
                                <Route index element={<Overview />} />
                                <Route path="lessons" element={<Lessons />} />
                                <Route path="exercises" element={<div>Exercises Management</div>} />
                                <Route path="users" element={<Users />} />
                                <Route path="settings" element={<Settings />} />
                            </Route>
                            {/* Redirect all other routes to home */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </ErrorBoundary>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
