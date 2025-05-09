import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: none;
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.normal} ${({ theme }) => theme.transitions.easeInOut};
    width: ${props => props.$fullWidth ? '100%' : 'auto'};

    /* Primary variant (default) */
    background-color: ${props => {
        const t = props.theme;
        if (props.$variant === 'secondary') return t.colors.secondary.main;
        if (props.$variant === 'text') return 'transparent';
        return t.colors.primary.main;
    }};
    color: ${props => {
        const t = props.theme;
        if (props.$variant === 'text') return t.colors.primary.main;
        return t.colors.primary.contrast;
    }};

    &:hover {
        background-color: ${props => {
            const t = props.theme;
            if (props.$variant === 'secondary') return t.colors.secondary.dark;
            if (props.$variant === 'text') return t.colors.primary.light;
            return t.colors.primary.dark;
        }};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Loading state */
    ${props => props.$isLoading && `
        position: relative;
        color: transparent;
        
        &::after {
            content: '';
            position: absolute;
            width: 1rem;
            height: 1rem;
            border: 2px solid ${props.theme.colors.primary.contrast};
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `}
`;

const Button = ({
    children,
    variant = 'primary',
    fullWidth = false,
    isLoading = false,
    disabled = false,
    ...props
}) => {
    return (
        <StyledButton
            $variant={variant}
            $fullWidth={fullWidth}
            $isLoading={isLoading}
            disabled={disabled || isLoading}
            {...props}
        >
            {children}
        </StyledButton>
    );
};

export default Button; 