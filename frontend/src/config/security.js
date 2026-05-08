import axios from 'axios';

// Create axios instance with security configurations
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Add request interceptor for CSRF token
api.interceptors.request.use((config) => {
    // Get CSRF token from meta tag if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle specific error cases
            switch (error.response.status) {
                case 401:
                    // Handle unauthorized
                    window.location.href = '/login';
                    break;
                case 403:
                    // Handle forbidden
                    window.location.href = '/';
                    break;
                case 429:
                    // Handle rate limiting
                    console.error('Too many requests. Please try again later.');
                    break;
                default:
                    console.error('An error occurred:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

// Security headers configuration
export const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:3000; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Token management
export const tokenManager = {
    getToken: () => {
        return localStorage.getItem('token');
    },
    setToken: (token) => {
        localStorage.setItem('token', token);
    },
    removeToken: () => {
        localStorage.removeItem('token');
    },
    isTokenValid: (token) => {
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
};

// Session management
export const sessionManager = {
    startSession: () => {
        sessionStorage.setItem('sessionStart', Date.now().toString());
    },
    endSession: () => {
        sessionStorage.clear();
        localStorage.removeItem('token');
    },
    isSessionValid: () => {
        const sessionStart = sessionStorage.getItem('sessionStart');
        if (!sessionStart) return false;
        const sessionAge = Date.now() - parseInt(sessionStart);
        return sessionAge < 24 * 60 * 60 * 1000; // 24 hours
    }
};

export default api; 