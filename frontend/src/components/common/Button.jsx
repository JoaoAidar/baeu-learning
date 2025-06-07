import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    border: none;
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.normal};
    width: ${props => props.$fullWidth ? '100%' : 'auto'};
    position: relative;
    overflow: hidden;

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
    box-shadow: ${props => {
        const t = props.theme;
        if (props.$variant === 'text') return 'none';
        return t.shadows.sm;
    }};

    &:hover {
        transform: translateY(-2px);
        background-color: ${props => {
            const t = props.theme;
            if (props.$variant === 'secondary') return t.colors.secondary.dark;
            if (props.$variant === 'text') return t.colors.primary.light;
            return t.colors.primary.dark;
        }};
        box-shadow: ${props => {
            const t = props.theme;
            if (props.$variant === 'text') return 'none';
            return t.shadows.md;
        }};
    }

    &:active {
        transform: translateY(0);
        box-shadow: ${props => {
            const t = props.theme;
            if (props.$variant === 'text') return 'none';
            return t.shadows.sm;
        }};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    /* Loading state */
    ${props => props.$loading && `
        cursor: wait;
        &::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
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

    /* Icon styling */
    svg {
        width: 1.25em;
        height: 1.25em;
    }
`;

const Button = ({ 
    children, 
    variant = 'primary', 
    fullWidth = false, 
    loading = false,
    ...props 
}) => {
    return (
        <StyledButton
            $variant={variant}
            $fullWidth={fullWidth}
            $loading={loading}
            disabled={loading || props.disabled}
            {...props}
        >
            {children}
        </StyledButton>
    );
};

export default Button; 