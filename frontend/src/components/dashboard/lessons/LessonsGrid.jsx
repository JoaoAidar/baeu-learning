import React from 'react';
import styled from 'styled-components';
import LessonCard from './LessonCard';
import { designSystem } from '../../../styles/designSystem';

const { colors, spacing, typography, borderRadius, shadows } = designSystem;

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: ${spacing.xl};
    padding: ${spacing.xl} 0;

    @media (max-width: ${designSystem.breakpoints.md}) {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: ${spacing.lg};
        padding: ${spacing.lg} 0;
    }

    @media (max-width: ${designSystem.breakpoints.sm}) {
        grid-template-columns: 1fr;
        gap: ${spacing.md};
        padding: ${spacing.md} 0;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: ${spacing['3xl']};
    color: ${colors.text.secondary};
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.lg};
    background-color: ${colors.background.paper};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.sm};
    margin: ${spacing.xl} 0;
`;

const ErrorState = styled(EmptyState)`
    color: ${colors.error.main};
    background-color: ${colors.error.light};
    border: 1px solid ${colors.error.main};
`;

const LoadingState = styled(EmptyState)`
    color: ${colors.text.secondary};
    background-color: ${colors.background.paper};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${spacing.md};

    &::after {
        content: '';
        width: 24px;
        height: 24px;
        border: 3px solid ${colors.neutral.light};
        border-top-color: ${colors.primary.main};
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const LessonsGrid = ({ lessons, loading, error }) => {
    if (loading) {
        return (
            <LoadingState>
                <span>Loading lessons...</span>
            </LoadingState>
        );
    }

    if (error) {
        return (
            <ErrorState>
                <p>{error}</p>
            </ErrorState>
        );
    }

    if (!lessons || lessons.length === 0) {
        return (
            <EmptyState>
                <p>No lessons available at the moment.</p>
            </EmptyState>
        );
    }

    return (
        <GridContainer>
            {lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
            ))}
        </GridContainer>
    );
};

export default LessonsGrid; 