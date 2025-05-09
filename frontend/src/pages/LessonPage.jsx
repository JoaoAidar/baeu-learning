import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/common/Button';
import { api } from '../utils/api';
import designSystem from '../styles/designSystem';

const { colors, spacing, typography, borderRadius } = designSystem;

const Container = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: ${spacing.xl};
`;

const Header = styled.div`
    margin-bottom: ${spacing.xl};
`;

const Title = styled.h1`
    color: ${colors.text.primary};
    font-size: ${typography.fontSize.xxl};
    margin-bottom: ${spacing.sm};
`;

const Description = styled.p`
    color: ${colors.text.secondary};
    font-size: ${typography.fontSize.md};
    margin-bottom: ${spacing.lg};
`;

const ExercisesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const ExerciseCard = styled.div`
    background-color: white;
    border-radius: ${borderRadius.lg};
    padding: ${spacing.lg};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border: 2px solid transparent;
    &:hover, &:focus {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        background-color: ${colors.primary.light};
        border-color: ${colors.primary.main};
        outline: none;
    }
`;

const ExerciseTitle = styled.h3`
    color: ${colors.text.primary};
    font-size: ${typography.fontSize.lg};
    margin-bottom: ${spacing.sm};
    font-weight: 600;
`;

const ExerciseDescription = styled.p`
    color: ${colors.text.secondary};
    font-size: ${typography.fontSize.md};
`;

const ExerciseTypeLabel = styled.span`
    display: inline-block;
    background: ${colors.secondary.light};
    color: ${colors.secondary.dark};
    font-size: ${typography.fontSize.sm};
    border-radius: ${borderRadius.full};
    padding: ${spacing.xs} ${spacing.sm};
    margin-bottom: ${spacing.sm};
    margin-right: ${spacing.sm};
    font-weight: 500;
`;

const DifficultyBadge = styled.span`
    display: inline-block;
    padding: ${spacing.xs} ${spacing.sm};
    background-color: ${props => {
        switch (props.$difficulty) {
            case 'easy': return colors.success.light;
            case 'medium': return colors.warning.light;
            case 'hard': return colors.error.light;
            default: return colors.neutral.light;
        }
    }};
    color: ${props => {
        switch (props.$difficulty) {
            case 'easy': return colors.success.dark;
            case 'medium': return colors.warning.dark;
            case 'hard': return colors.error.dark;
            default: return colors.text.primary;
        }
    }};
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.sm};
    margin-bottom: ${spacing.sm};
`;

const ErrorMessage = styled.div`
    color: ${colors.error.main};
    margin: ${spacing.md} 0;
    padding: ${spacing.md};
    background-color: ${colors.error.light};
    border-radius: 4px;
`;

const LoadingMessage = styled.div`
    text-align: center;
    margin: ${spacing.xl} 0;
`;

const NavigationButtons = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: ${spacing.xl};
`;

const LessonPage = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!lessonId) {
            setError('No lesson ID provided.');
            setLoading(false);
            return;
        }
        const fetchLessonAndExercises = async () => {
            try {
                // Fetch lesson details
                const lessonData = await api.get(`/lessons/${lessonId}`);
                setLesson(lessonData);

                // Fetch exercises for this lesson
                const exercisesData = await api.get(`/exercises/lesson/${lessonId}`);
                const exercisesArray = Array.isArray(exercisesData.exercises) ? exercisesData.exercises : [];
                setExercises(exercisesArray);
                setError(null);
            } catch (err) {
                setError('Failed to load lesson data. Please try again.');
                setExercises([]); // Reset exercises to empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchLessonAndExercises();
    }, [lessonId]);

    const handleExerciseClick = (exerciseId) => {
        const exerciseIds = exercises.map(ex => ex.exercise_id);
        navigate(`/lesson/${lessonId}/exercise/${exerciseId}`, {
            state: { exerciseList: exerciseIds }
        });
    };

    if (loading) {
        return <LoadingMessage>Loading lesson...</LoadingMessage>;
    }

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    if (!lesson) {
        return <ErrorMessage>Lesson not found</ErrorMessage>;
    }

    return (
        <Container>
            <Header>
                <Title>{lesson.title}</Title>
                <Description>{lesson.description}</Description>
            </Header>

            <ExercisesList>
                {exercises && exercises.length > 0 ? (
                    exercises.map((exercise, idx) => (
                        <ExerciseCard
                            key={exercise.exercise_id}
                            tabIndex={0}
                            onClick={() => handleExerciseClick(exercise.exercise_id)}
                            onKeyPress={e => { if (e.key === 'Enter') handleExerciseClick(exercise.exercise_id); }}
                        >
                            <ExerciseTypeLabel>{exercise.type.replace('_', ' ').toUpperCase()}</ExerciseTypeLabel>
                            <DifficultyBadge $difficulty={exercise.difficulty}>
                                {exercise.difficulty}
                            </DifficultyBadge>
                            <ExerciseTitle>{exercise.title || exercise.question || `Exercise ${idx + 1}`}</ExerciseTitle>
                            <ExerciseDescription>{exercise.description || exercise.prompt || ''}</ExerciseDescription>
                        </ExerciseCard>
                    ))
                ) : (
                    <ErrorMessage>No exercises available for this lesson.</ErrorMessage>
                )}
            </ExercisesList>

            <NavigationButtons>
                <Button
                    $variant="secondary"
                    onClick={() => navigate('/')}
                >
                    Back to Lessons
                </Button>
            </NavigationButtons>
        </Container>
    );
};

export default LessonPage; 