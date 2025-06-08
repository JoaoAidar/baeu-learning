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
    overflow: hidden;    /* Primary variant (default) - Red for primary actions */
    background-color: ${props => {
        const t = props.theme;
        if (props.$variant === 'secondary') return '#023e8a'; // Blue for secondary actions
        if (props.$variant === 'text') return 'transparent';
        return '#d62828'; // Red for primary actions
    }};
    color: ${props => {
        const t = props.theme;
        if (props.$variant === 'text') return '#d62828';
        return '#ffffff';
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
            if (props.$variant === 'secondary') return '#1e3a8a'; // Darker blue
            if (props.$variant === 'text') return 'rgba(214, 40, 40, 0.1)'; // Light red background
            return '#991b1b'; // Darker red
        }};
        box-shadow: ${props => {
            const t = props.theme;
            if (props.$variant === 'text') return 'none';
            return t.shadows.md;
        }};
    }

    &:focus {
        outline: none;
        box-shadow: ${props => {
            if (props.$variant === 'secondary') return '0 0 0 3px rgba(2, 62, 138, 0.2)'; // Blue focus ring
            if (props.$variant === 'text') return '0 0 0 3px rgba(214, 40, 40, 0.2)'; // Red focus ring
            return '0 0 0 3px rgba(214, 40, 40, 0.2)'; // Red focus ring
        }};
    }    &:active {
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
        background-color: #9ca3af !important;
    }    /* Loading state */
    ${props => props.$loading && `
        cursor: wait;
        &::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border: 2px solid #ffffff;
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