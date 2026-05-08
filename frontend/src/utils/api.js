import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Add request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
        
        // Get token from httpOnly cookie instead of localStorage
        // Token will be automatically included via withCredentials: true
        // No need to manually set Authorization header as we use cookies
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for logging
api.interceptors.response.use(
    (response) => {
        console.log(`Received response from ${response.config.url}:`, response.data);
        return response.data; // Return the data directly instead of the full response    },    (error) => {
        console.error('Response error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            // Only redirect to login if we're not already on the login/signup pages
            // and it's not a getCurrentUser call (which should fail silently)
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup');
            const isGetCurrentUser = error.config?.url?.includes('/auth/me');
            
            if (!isAuthPage && !isGetCurrentUser) {
                // Clear any stored authentication state
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                console.log('Unauthorized access, redirecting to login');
                window.location.href = '/login';
            }
            // For auth pages or getCurrentUser calls, just let the error propagate normally
        }
        return Promise.reject(error);
    }
);