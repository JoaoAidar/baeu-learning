import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});

// Mock window object
Object.defineProperty(global, 'window', {
    value: {
        performance: {
            mark: vi.fn(),
            measure: vi.fn(),
            getEntriesByName: vi.fn(),
            now: vi.fn(() => Date.now())
        },
        IntersectionObserver: vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        })),
        localStorage: {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn()
        },
        Image: vi.fn().mockImplementation(() => ({
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }))
    },
    writable: true
});

// Mock document object
Object.defineProperty(global, 'document', {
    value: {
        createElement: vi.fn().mockImplementation((tag) => ({
            tagName: tag,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            setAttribute: vi.fn(),
            appendChild: vi.fn()
        })),
        head: {
            appendChild: vi.fn()
        }
    },
    writable: true
});

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
    value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    },
    writable: true
});

// Mock IntersectionObserver
class IntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver
});

// Mock ResizeObserver
class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
}); 