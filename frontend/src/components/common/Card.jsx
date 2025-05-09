import React from 'react';
import styled from 'styled-components';

const StyledCard = styled.div`
    background-color: ${({ theme }) => theme.colors.neutral.white};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.lg};
    box-shadow: ${props => props.$elevated === "true" ? props.theme.shadows.md : 'none'};
    transition: all ${({ theme }) => theme.transitions.normal} ${({ theme }) => theme.transitions.easeInOut};
    cursor: ${props => props.$interactive === "true" ? 'pointer' : 'default'};

    &:hover {
        transform: ${props => props.$interactive === "true" ? 'translateY(-2px)' : 'none'};
        box-shadow: ${props => props.$interactive === "true" ? props.theme.shadows.lg : props.theme.shadows.md};
    }
`;

const CardHeader = styled.div`
    padding: ${({ theme }) => theme.spacing.lg};
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.medium};
    background-color: ${props => props.$variant === 'secondary' ? props.theme.colors.secondary.light : props.theme.colors.primary.light};
    color: ${props => props.$variant === 'secondary' ? props.theme.colors.secondary.contrast : props.theme.colors.primary.contrast};
`;

const CardTitle = styled.h3`
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    margin: 0;
    color: inherit;
`;

const CardSubtitle = styled.p`
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: inherit;
    opacity: 0.8;
    margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
`;

const CardContent = styled.div`
    padding: ${({ theme }) => theme.spacing.lg};
`;

const CardFooter = styled.div`
    padding: ${({ theme }) => theme.spacing.lg};
    border-top: 1px solid ${({ theme }) => theme.colors.neutral.medium};
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