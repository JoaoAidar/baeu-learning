import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from './authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState({});

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                const response = await AuthService.getCurrentUser();
                if (mounted) {
                    setUser(response?.user || null);
                    if (response?.user) {
                        try {
                            const progressData = await AuthService.getProgress();
                            if (mounted && progressData) {
                                setProgress(progressData);
                            }
                        } catch (progressError) {
                            console.error('Error loading initial progress:', progressError);
                            if (mounted) {
                                setProgress({});
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
                if (mounted) {
                    setUser(null);
                    setProgress({});
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const loadProgress = async () => {
        try {
            const progressData = await AuthService.getProgress();
            if (progressData) {
                setProgress(progressData);
            } else {
                setProgress({});
            }
        } catch (error) {
            console.error('Error loading progress:', error);
            setProgress({});
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await AuthService.login(username, password);
            if (response?.user) {
                setUser(response.user);
                try {
                    await loadProgress();
                } catch (progressError) {
                    console.error('Error loading progress after login:', progressError);
                    setProgress({});
                }
                return response.user;
            } else {
                throw new Error('Invalid login response');
            }
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
            setUser(null);
            setProgress({});
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            setProgress({});
            throw error;
        }
    };

    const updateProgress = async (lessonId, exerciseId, completed, correct) => {
        try {
            const updatedProgress = await AuthService.updateProgress(
                lessonId,
                exerciseId,
                completed,
                correct
            );
            setProgress(prev => ({
                ...prev,
                [lessonId]: {
                    ...prev[lessonId],
                    [exerciseId]: updatedProgress
                }
            }));
            return updatedProgress;
        } catch (error) {
            console.error('Update progress error:', error);
            throw error;
        }
    };

    const getLessonProgress = async (lessonId) => {
        try {
            const lessonProgress = await AuthService.getLessonProgress(lessonId);
            if (lessonProgress) {
                setProgress(prev => ({
                    ...prev,
                    [lessonId]: lessonProgress
                }));
            }
            return lessonProgress;
        } catch (error) {
            console.error('Get lesson progress error:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        error,
        progress,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        updateProgress,
        getLessonProgress
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 