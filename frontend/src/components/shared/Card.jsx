import React from 'react';
import styled from 'styled-components';

const StyledCard = styled.div`
    background-color: ${({ theme }) => theme.colors.background.paper};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.lg};
    box-shadow: ${props => props.$elevated === "true" ? props.theme.shadows.md : 'none'};
    transition: all ${({ theme }) => theme.transitions.normal};
    cursor: ${props => props.$interactive === "true" ? 'pointer' : 'default'};
    border: 1px solid ${({ theme }) => theme.colors.neutral.light};
    position: relative;
    overflow: hidden;

    &:hover {
        transform: ${props => props.$interactive === "true" ? 'translateY(-4px)' : 'none'};
        box-shadow: ${props => props.$interactive === "true" ? props.theme.shadows.lg : props.theme.shadows.md};
        border-color: ${props => props.$interactive === "true" ? props.theme.colors.primary.light : props.theme.colors.neutral.light};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.$variant === 'secondary' ? props.theme.colors.secondary.main : props.theme.colors.primary.main};
        opacity: ${props => props.$elevated === "true" ? 1 : 0};
        transition: opacity ${({ theme }) => theme.transitions.normal};
    }

    &:hover::before {
        opacity: 1;
    }
`;

const CardHeader = styled.div`
    padding: ${({ theme }) => theme.spacing.lg};
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.light};
    background-color: ${props => props.$variant === 'secondary' ? props.theme.colors.secondary.light : props.theme.colors.primary.light};
    color: ${props => props.$variant === 'secondary' ? props.theme.colors.secondary.contrast : props.theme.colors.primary.contrast};
    border-radius: ${({ theme }) => `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0`};
    margin: -${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h3`
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    margin: 0;
    color: inherit;
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const CardSubtitle = styled.p`
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: inherit;
    opacity: 0.9;
    margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const CardContent = styled.div`
    padding: ${({ theme }) => theme.spacing.lg};
    margin: -${({ theme }) => theme.spacing.lg};
    margin-top: 0;
`;

const CardFooter = styled.div`
    padding: ${({ theme }) => theme.spacing.lg};
    margin: -${({ theme }) => theme.spacing.lg};
    margin-top: 0;
    border-top: 1px solid ${({ theme }) => theme.colors.neutral.light};
    display: flex;
    justify-content: flex-end;
    gap: ${({ theme }) => theme.spacing.md};
`;

const Card = ({
    children,
    title,
    subtitle,
    footer,
    variant = 'primary',
    interactive = false,
    elevated = false,
    bordered = false,
    onClick,
    ...props
}) => {
    return (
        <StyledCard
            $interactive={interactive}
            $elevated={elevated}
            $bordered={bordered}
            onClick={onClick}
            {...props}
        >
            {(title || subtitle) && (
                <CardHeader $variant={variant}>
                    {title && <CardTitle>{title}</CardTitle>}
                    {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
                </CardHeader>
            )}
            <CardContent>{children}</CardContent>
            {footer && <CardFooter>{footer}</CardFooter>}
        </StyledCard>
    );
};

export default Card; 