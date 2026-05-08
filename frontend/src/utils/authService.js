import { api } from './api';

class AuthService {
    static async login(username, password) {
        try {
            const response = await api.post('/auth/login', { username, password });
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async logout() {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    static async getCurrentUser() {
        try {
            return await api.get('/auth/me');
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    }

    static async updateProgress(lessonId, exerciseId, completed, correct) {
        try {
            return await api.post('/auth/progress', {
                lessonId,
                exerciseId,
                completed,
                correct
            });
        } catch (error) {
            console.error('Update progress error:', error);
            throw error;
        }
    }

    static async getProgress() {
        try {
            return await api.get('/auth/progress');
        } catch (error) {
            console.error('Get progress error:', error);
            throw error;
        }
    }

    static async getLessonProgress(lessonId) {
        try {
            return await api.get(`/auth/progress/${lessonId}`);
        } catch (error) {
            console.error('Get lesson progress error:', error);
            throw error;
        }
    }
}

export default AuthService; 