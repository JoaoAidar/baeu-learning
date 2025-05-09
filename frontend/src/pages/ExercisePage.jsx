import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ExerciseRenderer from '../components/exercises/ExerciseRenderer';
import Button from '../components/common/Button';
import { api } from '../utils/api';
import { Container } from '../styles/designSystem';
import Hangul from 'hangul-js';

const ExerciseContainer = styled.div`
    width: 100%;
    margin: 0;
    padding: ${({ theme }) => theme.spacing.xl};
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.background.default};
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        padding: ${({ theme }) => theme.spacing.lg};
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        padding: ${({ theme }) => theme.spacing.md};
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
        padding: ${({ theme }) => theme.spacing.sm};
    }
`;

const ContentWrapper = styled(Container)`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xl};
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background-color: ${({ theme }) => theme.colors.neutral.light};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    overflow: hidden;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Progress = styled.div`
    height: 100%;
    background-color: ${({ theme }) => theme.colors.primary.main};
    width: ${props => props.$progress}%;
    transition: width 0.3s ease;
`;

const NavigationButtons = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: ${({ theme }) => theme.spacing.xl};
    gap: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.div`
    color: ${({ theme }) => theme.colors.error.main};
    margin: ${({ theme }) => theme.spacing.md} 0;
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.error.light};
    border-radius: 4px;
`;

const LoadingMessage = styled.div`
    text-align: center;
    margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const CompletionMessage = styled.div`
    color: ${({ theme }) => theme.colors.success.main};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    text-align: center;
    margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const ExercisePage = () => {
    const { lessonId, exerciseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNext, setShowNext] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get exercise list from location state (passed from LessonPage)
    const exerciseList = location.state?.exerciseList || [];
    const currentIndex = exerciseList.findIndex(id => id === exerciseId);
    const nextExerciseId = currentIndex !== -1 && currentIndex < exerciseList.length - 1 ? exerciseList[currentIndex + 1] : null;

    const progress = exerciseList.length > 0 && currentIndex !== -1 ? ((currentIndex + 1) / exerciseList.length) * 100 : 0;

    useEffect(() => {
        setShowNext(false);
        setCompleted(false);
        setIsSubmitting(false);
        if (!exerciseId) {
            setError('Exercise ID is missing from the URL.');
            setLoading(false);
            return;
        }
        const fetchExercise = async () => {
            try {
                const data = await api.get(`/exercises/${exerciseId}`);
                setExercise(data);
                setError(null);
            } catch (err) {
                setError('Failed to load exercise. Please try again.');
                console.error('Error fetching exercise:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExercise();
    }, [exerciseId]);

    const handleSubmit = async (answer) => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            const response = await api.post(`/exercises/${exerciseId}/submit`, {
                answer,
                lessonId
            });
            setShowNext(true);
            if (!nextExerciseId) {
                setCompleted(true);
            }
        } catch (err) {
            setError('Failed to submit answer. Please try again.');
            console.error('Error submitting exercise:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (nextExerciseId) {
            navigate(`/lesson/${lessonId}/exercise/${nextExerciseId}`, {
                state: { exerciseList }
            });
        } else {
            setCompleted(true);
        }
    };

    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
            navigate(`/lesson/${lessonId}`);
        }
    };

    if (loading) {
        return <LoadingMessage>Loading exercise...</LoadingMessage>;
    }

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    if (!exercise) {
        return <ErrorMessage>Exercise not found</ErrorMessage>;
    }

    return (
        <ExerciseContainer>
            <ContentWrapper>
                <ProgressBar>
                    <Progress $progress={progress} />
                </ProgressBar>
                <ExerciseRenderer
                    exercise={exercise}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
                <NavigationButtons>
                    <Button
                        $variant="secondary"
                        onClick={handleExit}
                        disabled={isSubmitting}
                    >
                        Exit Exercise
                    </Button>
                    {showNext && !completed && (
                        <Button 
                            $variant="primary" 
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            {nextExerciseId ? 'Next Exercise' : 'Complete Lesson'}
                        </Button>
                    )}
                </NavigationButtons>
                {completed && (
                    <CompletionMessage>
                        Congratulations! You have completed all exercises in this lesson.
                    </CompletionMessage>
                )}
            </ContentWrapper>
        </ExerciseContainer>
    );
};

export default ExercisePage; 