import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import { renderWithProviders } from '../../../test/utils';

// Component that throws an error
const ThrowError = () => {
    throw new Error('Test error');
};

describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Test content</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders error UI when there is an error', () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText(/We apologize for the inconvenience/)).toBeInTheDocument();
        expect(screen.getByText('Refresh Page')).toBeInTheDocument();
        expect(screen.getByText('Go to Home')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });

    it('shows error details in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Error Details:')).toBeInTheDocument();
        expect(screen.getByText(/Test error/)).toBeInTheDocument();

        consoleSpy.mockRestore();
        process.env.NODE_ENV = originalEnv;
    });

    it('refreshes page when refresh button is clicked', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        fireEvent.click(screen.getByText('Refresh Page'));
        expect(reloadSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
        reloadSpy.mockRestore();
    });

    it('navigates to home when home button is clicked', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { container } = renderWithProviders(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        fireEvent.click(screen.getByText('Go to Home'));
        expect(window.location.pathname).toBe('/');

        consoleSpy.mockRestore();
    });
}); 