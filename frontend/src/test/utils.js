import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
export function renderWithProviders(ui, { route = '/' } = {}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    window.history.pushState({}, 'Test page', route);

    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {ui}
            </BrowserRouter>
        </QueryClientProvider>
    );
}

// Mock API response
export const mockApiResponse = (data, status = 200) => {
    return Promise.resolve({
        data,
        status,
        statusText: 'OK',
        headers: {},
        config: {},
    });
};

// Mock API error
export const mockApiError = (status = 500, message = 'Internal Server Error') => {
    return Promise.reject({
        response: {
            status,
            data: { message },
        },
    });
};

// Mock localStorage
export const mockLocalStorage = () => {
    const store = {};
    return {
        getItem: vi.fn((key) => store[key]),
        setItem: vi.fn((key, value) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            Object.keys(store).forEach(key => delete store[key]);
        }),
    };
};

// Mock sessionStorage
export const mockSessionStorage = () => {
    const store = {};
    return {
        getItem: vi.fn((key) => store[key]),
        setItem: vi.fn((key, value) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            Object.keys(store).forEach(key => delete store[key]);
        }),
    };
};

// Wait for element to be removed from DOM
export const waitForElementToBeRemoved = async (element) => {
    await new Promise(resolve => setTimeout(resolve, 0));
    return !document.body.contains(element);
};

// Mock IntersectionObserver
export const mockIntersectionObserver = (isIntersecting = true) => {
    const mock = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    };

    Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        configurable: true,
        value: class {
            constructor(callback) {
                this.callback = callback;
            }
            observe() {
                this.callback([{ isIntersecting }]);
            }
            unobserve() {}
            disconnect() {}
        },
    });

    return mock;
}; 