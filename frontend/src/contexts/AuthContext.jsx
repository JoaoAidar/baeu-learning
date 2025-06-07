import React, { createContext, useContext, useState } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/auth/login', { username, password });
            setUser(response.data.user);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.error || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/auth/register', { username, email, password });
            return response.data;
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await api.post('/auth/logout');
            setUser(null);
        } catch (error) {
            setError(error.response?.data?.error || 'Logout failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 