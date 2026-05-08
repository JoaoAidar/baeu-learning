import { z } from 'zod';

// Common validation schemas
export const loginSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export const registerSchema = loginSchema.extend({
    email: z.string()
        .email('Invalid email address')
        .min(5, 'Email must be at least 5 characters')
        .max(100, 'Email must be less than 100 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

export const lessonSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be less than 100 characters'),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters'),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    category: z.string()
        .min(1, 'Category is required')
});

export const exerciseSchema = z.object({
    question: z.string()
        .min(5, 'Question must be at least 5 characters')
        .max(500, 'Question must be less than 500 characters'),
    options: z.array(z.string())
        .min(2, 'At least 2 options are required')
        .max(6, 'Maximum 6 options allowed'),
    correctAnswer: z.number()
        .min(0, 'Invalid correct answer')
        .max(5, 'Invalid correct answer'),
    explanation: z.string()
        .min(10, 'Explanation must be at least 10 characters')
        .max(500, 'Explanation must be less than 500 characters')
});

// Validation helper functions
export const validateForm = (schema, data) => {
    try {
        schema.parse(data);
        return { isValid: true, errors: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.reduce((acc, curr) => {
                const field = curr.path[0];
                acc[field] = curr.message;
                return acc;
            }, {});
            return { isValid: false, errors };
        }
        throw error;
    }
};

// Sanitization helper functions
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '') // Remove < and > to prevent XSS
        .trim();
};

export const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}; 