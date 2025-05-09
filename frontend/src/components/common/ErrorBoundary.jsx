import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
    padding: ${({ theme }) => theme.spacing.xl};
    margin: ${({ theme }) => theme.spacing.xl} auto;
    max-width: 600px;
    background-color: ${({ theme }) => theme.colors.error.light};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    text-align: center;
`;

const ErrorTitle = styled.h2`
    color: ${({ theme }) => theme.colors.error.dark};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.p`
    color: ${({ theme }) => theme.colors.error.dark};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const RetryButton = styled.button`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
    background-color: ${({ theme }) => theme.colors.error.main};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${({ theme }) => theme.colors.error.dark};
    }
`;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorContainer>
                    <ErrorTitle>Something went wrong</ErrorTitle>
                    <ErrorMessage>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </ErrorMessage>
                    <RetryButton onClick={this.handleRetry}>
                        Try Again
                    </RetryButton>
                </ErrorContainer>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 