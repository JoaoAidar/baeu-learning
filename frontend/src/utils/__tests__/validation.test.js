import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, lessonSchema, exerciseSchema, validateForm, sanitizeInput, sanitizeObject } from '../validation';

describe('Validation Schemas', () => {
    describe('loginSchema', () => {
        it('validates correct login data', () => {
            const validData = {
                username: 'testuser123',
                password: 'Test123!@#'
            };
            const result = validateForm(loginSchema, validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toBeNull();
        });

        it('rejects invalid username', () => {
            const invalidData = {
                username: 'te', // too short
                password: 'Test123!@#'
            };
            const result = validateForm(loginSchema, invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors.username).toBeDefined();
        });

        it('rejects invalid password', () => {
            const invalidData = {
                username: 'testuser123',
                password: 'weak' // too weak
            };
            const result = validateForm(loginSchema, invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors.password).toBeDefined();
        });
    });

    describe('registerSchema', () => {
        it('validates correct registration data', () => {
            const validData = {
                username: 'testuser123',
                password: 'Test123!@#',
                email: 'test@example.com',
                confirmPassword: 'Test123!@#'
            };
            const result = validateForm(registerSchema, validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toBeNull();
        });

        it('rejects mismatched passwords', () => {
            const invalidData = {
                username: 'testuser123',
                password: 'Test123!@#',
                email: 'test@example.com',
                confirmPassword: 'Different123!@#'
            };
            const result = validateForm(registerSchema, invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors.confirmPassword).toBeDefined();
        });
    });

    describe('lessonSchema', () => {
        it('validates correct lesson data', () => {
            const validData = {
                title: 'Test Lesson',
                description: 'This is a test lesson description that is long enough',
                difficulty: 'beginner',
                category: 'grammar'
            };
            const result = validateForm(lessonSchema, validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toBeNull();
        });

        it('rejects invalid difficulty', () => {
            const invalidData = {
                title: 'Test Lesson',
                description: 'This is a test lesson description',
                difficulty: 'invalid',
                category: 'grammar'
            };
            const result = validateForm(lessonSchema, invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors.difficulty).toBeDefined();
        });
    });

    describe('exerciseSchema', () => {
        it('validates correct exercise data', () => {
            const validData = {
                question: 'What is the correct answer?',
                options: ['Option 1', 'Option 2', 'Option 3'],
                correctAnswer: 0,
                explanation: 'This is a detailed explanation of the correct answer'
            };
            const result = validateForm(exerciseSchema, validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toBeNull();
        });

        it('rejects invalid number of options', () => {
            const invalidData = {
                question: 'What is the correct answer?',
                options: ['Option 1'], // too few options
                correctAnswer: 0,
                explanation: 'This is a detailed explanation'
            };
            const result = validateForm(exerciseSchema, invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors.options).toBeDefined();
        });
    });
});

describe('Sanitization Functions', () => {
    describe('sanitizeInput', () => {
        it('removes HTML tags', () => {
            const input = '<script>alert("xss")</script>';
            expect(sanitizeInput(input)).toBe('scriptalert("xss")/script');
        });

        it('trims whitespace', () => {
            const input = '  test  ';
            expect(sanitizeInput(input)).toBe('test');
        });

        it('handles non-string input', () => {
            const input = 123;
            expect(sanitizeInput(input)).toBe(123);
        });
    });

    describe('sanitizeObject', () => {
        it('sanitizes all string values in an object', () => {
            const input = {
                name: '<script>alert("xss")</script>',
                age: 25,
                email: '  test@example.com  ',
                nested: {
                    description: '<p>test</p>'
                }
            };
            const expected = {
                name: 'scriptalert("xss")/script',
                age: 25,
                email: 'test@example.com',
                nested: {
                    description: 'ptest/p'
                }
            };
            expect(sanitizeObject(input)).toEqual(expected);
        });

        it('handles null and undefined values', () => {
            const input = {
                name: null,
                email: undefined,
                age: 25
            };
            expect(sanitizeObject(input)).toEqual(input);
        });
    });
}); 