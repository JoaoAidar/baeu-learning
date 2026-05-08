import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ExerciseRenderer from '../components/exercises/ExerciseRenderer'; // Assuming this component renders the exercise question and handles user input
import Button from '../components/shared/Button';
import { api } from '../utils/api';
// Assuming Container is a styled-component you define in designSystem or similar
import designSystem from '../styles/designSystem'; 
// If Container is meant to be imported directly, adjust the import.
// For now, let's assume it's part of your designSystem's styled components or a common wrapper.
const { colors, spacing, typography, borderRadius, breakpoints, shadows, Container } = designSystem;

// --- Styled Components ---

const ExerciseContainer = styled.div`
    width: 100%;
    margin: 0;
    padding: ${spacing.xl};
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: ${colors.background.default};
    min-height: calc(100vh - 120px); /* Adjust based on your Layout's header/footer if any */

    /* Tailwind equivalent: xl:px-8 lg:px-6 md:px-4 px-3 */
    @media (max-width: 1280px) {
        padding: ${spacing.lg};
    }
    
    @media (max-width: 1024px) {
        padding: ${spacing.md};
    }
    
    @media (max-width: 768px) {
        padding: ${spacing.sm};
        min-height: calc(100vh - 80px);
    }
    
    @media (max-width: 640px) {
        padding: ${spacing.xs} ${spacing.sm};
        min-height: calc(100vh - 60px);
    }
`;

const ContentWrapper = styled(Container)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xl};
    background-color: ${colors.background.paper}; /* Added for better visual separation */
    padding: ${spacing.xl};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.lg};
    width: 100%;
    max-width: 800px; /* Max width for content within container */

    /* Tailwind equivalent: lg:p-8 md:p-6 p-4 lg:gap-8 md:gap-6 gap-4 */
    @media (max-width: 1024px) {
        padding: ${spacing.lg};
        gap: ${spacing.lg};
        max-width: 700px;
    }
    
    @media (max-width: 768px) {
        padding: ${spacing.md};
        gap: ${spacing.md};
        max-width: 100%;
        border-radius: ${borderRadius.md};
        box-shadow: ${shadows.md};
    }
    
    @media (max-width: 640px) {
        padding: ${spacing.sm};
        gap: ${spacing.sm};
        border-radius: ${borderRadius.sm};
        box-shadow: ${shadows.sm};
    }
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background-color: ${colors.neutral.light};
    border-radius: ${borderRadius.full};
    overflow: hidden;
    margin-bottom: ${spacing.xl};
`;

const Progress = styled.div`
    height: 100%;
    background-color: ${colors.primary.main};
    width: ${props => props.$progress}%;
    transition: width 0.3s ease;
`;

const NavigationButtons = styled.div`
    display: flex;
    justify-content: space-between;
    gap: ${spacing.md};
    margin-top: ${spacing.xl};
    padding-top: ${spacing.lg};
    border-top: 1px solid ${colors.neutral.main};

    /* Tailwind equivalent: md:flex-row md:justify-between flex-col-reverse gap-3 */
    @media (max-width: 768px) {
        flex-direction: column-reverse;
        gap: ${spacing.sm};
        margin-top: ${spacing.lg};
        padding-top: ${spacing.md};
    }
    
    @media (max-width: 640px) {
        gap: ${spacing.xs};
        margin-top: ${spacing.md};
        padding-top: ${spacing.sm};
    }
`;

const StyledMessage = styled.div`
    text-align: center;
    margin: ${spacing.xl} 0;
    padding: ${spacing.lg};
    border-radius: ${borderRadius.md};
    font-size: ${typography.fontSize.md};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${spacing.sm};
    line-height: 1.5;

    &.error {
        color: ${colors.error.main};
        background-color: ${colors.error.light};
        border: 1px solid ${colors.error.main};
    }

    &.loading {
        color: ${colors.text.secondary};
        background-color: ${colors.neutral.light};
    }
    
    /* Tailwind equivalent: md:text-base text-sm md:p-4 p-3 md:mx-0 mx-2 */
    @media (max-width: 768px) {
        font-size: ${typography.fontSize.sm};
        padding: ${spacing.md};
        margin: ${spacing.lg} ${spacing.sm};
        flex-direction: column;
        gap: ${spacing.xs};
    }
    
    @media (max-width: 640px) {        font-size: ${typography.fontSize.xs};
        padding: ${spacing.sm};
        margin: ${spacing.md} 0;
    }
`;

const CompletionMessage = styled.div`
    text-align: center;
    margin: ${spacing.xxl} 0;
    padding: ${spacing.xl};
    background-color: ${colors.success.light};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.lg};
    color: ${colors.text.primary};

    .completion-icon {
        font-size: 4rem;
        margin-bottom: ${spacing.lg};
        animation: bounce 1s ease infinite;
    }

    h2 {
        color: ${colors.success.dark};
        font-family: ${typography.fontFamily.heading};
        font-size: ${typography.fontSize.xxl};
        margin-bottom: ${spacing.md};
    }

    p {
        color: ${colors.text.secondary};
        font-size: ${typography.fontSize.lg};
        margin-bottom: ${spacing.xl};
    }

    button {
        margin-top: ${spacing.lg};
    }

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
`;

const ExerciseStatus = styled.div`
    text-align: center;
    color: ${colors.text.secondary};
    font-size: ${typography.fontSize.sm};
    margin-bottom: ${spacing.xl};
    
    span {
        display: inline-block;
        padding: ${spacing.sm} ${spacing.md};
        background-color: ${colors.background.paper};
        border-radius: ${borderRadius.full};
        box-shadow: ${shadows.sm};
    }
`;

// --- Main ExercisePage Component ---

const ExercisePage = () => {
    const { lessonId, exerciseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNextButton, setShowNextButton] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null); // To store feedback from submission

    // Get exercise list from location state (passed from LessonPage)
    // Initialize with empty array if not provided, or fetch if necessary (see useEffect)
    const [exerciseList, setExerciseList] = useState(location.state?.exerciseList || []);

    // Derived state for current exercise index and progress
    const currentIndex = exerciseList.findIndex(id => id === exerciseId);
    const nextExerciseId = currentIndex !== -1 && currentIndex < exerciseList.length - 1 ? exerciseList[currentIndex + 1] : null;
    const isLessonCompleted = currentIndex === exerciseList.length - 1 && showNextButton; // Exercise completed, and it's the last one
    
    // Progress calculation
    const progress = exerciseList.length > 0 && currentIndex !== -1 ? ((currentIndex + 1) / exerciseList.length) * 100 : 0;

    // Effect to fetch the list of exercises if not provided via location state
    // This makes the component more robust if a user lands directly on an exercise page
    useEffect(() => {
        if (exerciseList.length === 0 && lessonId) {
            const fetchLessonExercises = async () => {
                try {
                    const data = await api.get(`/lessons/${lessonId}/exercises`); // Assuming this endpoint gives an array of exercise IDs
                    setExerciseList(data.map(ex => ex.exercise_id)); // Map to just IDs if the API returns full objects
                } catch (err) {
                    console.error('Failed to fetch exercise list:', err);
                    // Decide if this is a fatal error or just means progress won't be tracked perfectly
                }
            };
            fetchLessonExercises();
        }
    }, [lessonId, exerciseList.length]); // Re-run if lessonId changes or list is empty


    // Effect to fetch current exercise details
    useEffect(() => {
        // Reset states for new exercise
        setShowNextButton(false);
        setFeedback(null);
        setIsSubmitting(false);

        if (!exerciseId) {
            setError('Exercise ID is missing from the URL.');
            setLoading(false);
            return;
        }

        setLoading(true); // Set loading true for each new exercise fetch
        const fetchExercise = async () => {
            try {
                console.log('Fetching exercise with ID:', exerciseId);
                const data = await api.get(`/exercises/${exerciseId}`);
                console.log('Received exercise data:', data);
                
                // Ensure the exercise data has the correct structure for ExerciseRenderer
                // Assumes your API response `data` directly contains prompt, options, type, etc.
                const processedExercise = {
                    ...data,
                    // If options come as objects, map them to strings for simpler rendering
                    options: data.options?.map(opt => typeof opt === 'object' ? opt.text || opt.id : opt) || []
                };
                
                console.log('Processed exercise data:', processedExercise);
                setExercise(processedExercise);
                setError(null);
            } catch (err) {
                setError('Falha ao carregar o exercício. Por favor, tente novamente.');
                console.error('Error fetching exercise:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExercise();
    }, [exerciseId]); // Re-fetch whenever exerciseId changes

    const handleSubmit = useCallback(async (answer) => {
        if (isSubmitting || !exercise) return; // Prevent multiple submissions or if no exercise loaded
        
        setIsSubmitting(true);
        try {
            const response = await api.post(`/exercises/${exerciseId}/submit`, {
                answer,
                lessonId // Sending lessonId with submission might be useful for backend tracking
            });
            
            // Set feedback from the API response
            setFeedback(response.data);
            setShowNextButton(true); // Enable "Next" button after submission
        } catch (err) {
            setError(err.response?.data?.message || 'Falha ao enviar a resposta. Por favor, tente novamente.');
            console.error('Error submitting exercise:', err);
            setFeedback({ is_correct: false, explanation: "Erro na submissão." }); // Provide generic feedback
        } finally {
            setIsSubmitting(false);
        }
    }, [exerciseId, lessonId, exercise, isSubmitting]);

    const handleNext = useCallback(() => {
        if (nextExerciseId) {
            navigate(`/lessons/${lessonId}/exercise/${nextExerciseId}`, {
                state: { exerciseList } // Pass the updated exerciseList to the next route
            });
        } else {
            // If no next exercise, it means the lesson is completed
            // The isLessonCompleted state derived above will handle the rendering.
            // No explicit state change needed here for `completed` if derived state handles it.
            // Potentially navigate to a lesson summary page or dashboard
            // For now, it will just show the CompletionMessage within this page.
        }
    }, [nextExerciseId, lessonId, navigate, exerciseList]);

    const handleExit = useCallback(() => {
        if (window.confirm('Tem certeza que deseja sair? Seu progresso será salvo.')) {
            navigate(`/lessons/${lessonId}`); // Navigate back to the lesson overview
        }
    }, [lessonId, navigate]);

    // --- Conditional Rendering ---
    if (loading) {
        return (
            <ExerciseContainer>
                <ContentWrapper>
                    <StyledMessage className="loading">Carregando exercício...</StyledMessage>
                </ContentWrapper>
            </ExerciseContainer>
        );
    }

    if (error) {
        return (
            <ExerciseContainer>
                <ContentWrapper>
                    <StyledMessage className="error">{error}</StyledMessage>
                    <Button onClick={() => navigate(`/lessons/${lessonId}`)} $variant="secondary">Return to Lesson</Button>
                </ContentWrapper>
            </ExerciseContainer>
        );
    }

    // Check if the lesson is completed (all exercises done for this session)
    if (isLessonCompleted) {
        return (
            <ExerciseContainer>
                <ContentWrapper>
                    <CompletionMessage>
                        <div className="completion-icon">🎉</div>
                        <h2>Parabéns!</h2>
                        <p>Você completou todos os exercícios desta aula.</p>
                        <Button
                            $variant="primary"
                            onClick={() => navigate(`/lessons/${lessonId}`)}
                        >
                            Voltar para a Aula
                        </Button>
                    </CompletionMessage>
                </ContentWrapper>
            </ExerciseContainer>
        );
    }

    if (!exercise) {
        // This case should ideally be caught by error or loading states,
        // but as a fallback.
        return (
            <ExerciseContainer>
                <ContentWrapper>
                    <StyledMessage className="error">Exercício não encontrado.</StyledMessage>
                </ContentWrapper>
            </ExerciseContainer>
        );
    }

    return (
        <ExerciseContainer>
            <ContentWrapper>
                <ProgressBar>
                    <Progress $progress={progress} />
                </ProgressBar>
                <ExerciseStatus>
                    <span>Exercício {currentIndex + 1} de {exerciseList.length}</span>
                </ExerciseStatus>
                
                <ExerciseRenderer
                    exercise={exercise}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    feedback={feedback} // Pass feedback to the renderer for display
                />

                <NavigationButtons>
                    <Button
                        $variant="secondary"
                        onClick={handleExit}
                        disabled={isSubmitting}
                    >
                        Salvar & Sair
                    </Button>
                    {showNextButton && ( // Only show "Next" button after submission
                        <Button
                            $variant="primary"
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            {nextExerciseId ? 'Próximo Exercício →' : 'Concluir Aula ✓'}
                        </Button>
                    )}
                </NavigationButtons>
            </ContentWrapper>
        </ExerciseContainer>
    );
};

export default ExercisePage;