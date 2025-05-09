import React from 'react';
import styled from 'styled-components';
import LessonCard from './LessonCard';
import designSystem from '../../styles/designSystem';

const { spacing, breakpoints } = designSystem;

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: ${spacing.xl};
    padding: ${spacing.xl} 0;

    @media (max-width: ${breakpoints.md}) {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: ${spacing.lg};
        padding: ${spacing.lg} 0;
    }

    @media (max-width: ${breakpoints.sm}) {
        grid-template-columns: 1fr;
        gap: ${spacing.md};
        padding: ${spacing.md} 0;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: ${spacing['3xl']};
    color: ${designSystem.colors.neutral.dark};
    font-family: ${designSystem.typography.fontFamily.primary};
    font-size: ${designSystem.typography.fontSize.lg};
`;

const ErrorState = styled(EmptyState)`
    color: ${designSystem.colors.error.main};
`;

const LoadingState = styled(EmptyState)`
    color: ${designSystem.colors.neutral.medium};
`;

const LessonsGrid = ({ lessons, loading, error }) => {
    console.log('LessonsGrid rendered with:', {
        lessonsCount: lessons?.length,
        loading,
        error,
        lessons
    });

    if (loading) {
        console.log('LessonsGrid: Rendering loading state');
        return (
            <LoadingState>
                <p>Loading lessons...</p>
            </LoadingState>
        );
    }

    if (error) {
        console.log('LessonsGrid: Rendering error state:', error);
        return (
            <ErrorState>
                <p>{error}</p>
            </ErrorState>
        );
    }

    if (!lessons || lessons.length === 0) {
        console.log('LessonsGrid: Rendering empty state');
        return (
            <EmptyState>
                <p>No lessons available at the moment.</p>
            </EmptyState>
        );
    }

    console.log('LessonsGrid: Rendering grid with lessons:', lessons);
    return (
        <GridContainer>
            {lessons.map((lesson) => {
                console.log('Rendering LessonCard for:', lesson);
                return <LessonCard key={lesson.id} lesson={lesson} />;
            })}
        </GridContainer>
    );
};

export default LessonsGrid; 