import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import KoreanInput from '../KoreanInput';
import { typography, spacing } from '../../styles/designSystem';

// QWERTY to Korean jamo mapping and layout
const keyboardRows = [
  [
    { en: 'Q', kr: 'ㅂ' }, { en: 'W', kr: 'ㅈ' }, { en: 'E', kr: 'ㄷ' }, { en: 'R', kr: 'ㄱ' }, { en: 'T', kr: 'ㅅ' }, { en: 'Y', kr: 'ㅛ' }, { en: 'U', kr: 'ㅕ' }, { en: 'I', kr: 'ㅑ' }, { en: 'O', kr: 'ㅐ' }, { en: 'P', kr: 'ㅔ' }
  ],
  [
    { en: 'A', kr: 'ㅁ' }, { en: 'S', kr: 'ㄴ' }, { en: 'D', kr: 'ㅇ' }, { en: 'F', kr: 'ㄹ' }, { en: 'G', kr: 'ㅎ' }, { en: 'H', kr: 'ㅗ' }, { en: 'J', kr: 'ㅓ' }, { en: 'K', kr: 'ㅏ' }, { en: 'L', kr: 'ㅣ' }
  ],
  [
    { en: 'Z', kr: 'ㅋ' }, { en: 'X', kr: 'ㅌ' }, { en: 'C', kr: 'ㅊ' }, { en: 'V', kr: 'ㅍ' }, { en: 'B', kr: 'ㅠ' }, { en: 'N', kr: 'ㅜ' }, { en: 'M', kr: 'ㅡ' }, { en: 'Space', kr: ' ' }
  ]
];
const qwertyToJamo = {
  q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ',
  a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ',
  z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ',
  Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ', O: 'ㅒ', P: 'ㅖ',
};

const ExerciseContainer = styled.div`
    background-color: ${({ theme }) => theme.colors.background.paper};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.xl};
    box-shadow: ${({ theme }) => theme.shadows.md};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    width: 100%;
    min-height: calc(50vh - 64px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    @media (max-width: 1024px) {
        padding: ${({ theme }) => theme.spacing.lg};
        min-height: calc(60vh - 64px);
    }
    @media (max-width: 768px) {
        padding: ${({ theme }) => theme.spacing.md};
        min-height: calc(70vh - 64px);
    }
    @media (max-width: 640px) {
        padding: ${({ theme }) => theme.spacing.sm};
        border-radius: ${({ theme }) => theme.borderRadius.md};
        min-height: calc(80vh - 64px);
    }
`;

const Question = styled.h3`
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-size: clamp(${({ theme }) => theme.typography.fontSize.md}, 5vw, ${({ theme }) => theme.typography.fontSize.xl});
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    line-height: 1.4;
`;

const DifficultyBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    background-color: ${props => {
        const t = props.theme;
        switch (props.$difficulty) {
            case 'easy':
                return t.colors.success.light;
            case 'medium':
                return t.colors.warning.light;
            case 'hard':
                return t.colors.error.light;
            default:
                return t.colors.neutral.light;
        }
    }};
    color: ${props => {
        const t = props.theme;
        switch (props.$difficulty) {
            case 'easy':
                return t.colors.success.dark;
            case 'medium':
                return t.colors.warning.dark;
            case 'hard':
                return t.colors.error.dark;
            default:
                return t.colors.text.primary;
        }
    }};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transition: all ${({ theme }) => theme.transitions.normal};

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.shadows.md};
    }
`;

const OptionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    width: 100%;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 640px) {
        gap: ${({ theme }) => theme.spacing.sm};
        margin-bottom: ${({ theme }) => theme.spacing.lg};
    }
`;

const OptionButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
    background-color: ${({ theme }) => theme.colors.background.paper};
    border: 2px solid ${({ theme }) => theme.colors.neutral.light};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.normal};
    text-align: left;
    width: 100%;

    &:hover {
        border-color: ${({ theme }) => theme.colors.primary.main};
        background-color: ${({ theme }) => theme.colors.primary.light};
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active {
        transform: translateY(0);
    }

    ${props => props.$selected && `
        border-color: ${props.theme.colors.primary.main};
        background-color: ${props.theme.colors.primary.light};
        color: ${props.theme.colors.primary.contrast};
    `}

    ${props => props.$correct && `
        border-color: ${props.theme.colors.success.main};
        background-color: ${props.theme.colors.success.light};
        color: ${props.theme.colors.success.contrast};
    `}

    ${props => props.$incorrect && `
        border-color: ${props.theme.colors.error.main};
        background-color: ${props.theme.colors.error.light};
        color: ${props.theme.colors.error.contrast};
    `}

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
        box-shadow: none;
    }
`;

const FeedbackMessage = styled.div`
    margin-top: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    text-align: center;
    animation: fadeIn 0.3s ease-in-out;

    ${props => props.$type === 'success' && `
        background-color: ${props.theme.colors.success.light};
        color: ${props.theme.colors.success.dark};
    `}

    ${props => props.$type === 'error' && `
        background-color: ${props.theme.colors.error.light};
        color: ${props.theme.colors.error.dark};
    `}

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background-color: ${({ theme }) => theme.colors.neutral.light};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    margin: ${({ theme }) => theme.spacing.lg} 0;
    overflow: hidden;
`;

const Progress = styled.div`
    width: ${props => props.$progress}%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.primary.main};
    transition: width 0.3s ease;
    border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const ExerciseTitle = styled.h2`
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    text-align: center;
`;

const ExerciseDescription = styled.p`
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    text-align: center;
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const MatchingContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${({ theme }) => theme.spacing.sm};
    }
`;

const MatchingItem = styled.div`
    padding: ${({ theme }) => theme.spacing.md};
    border: 2px solid ${({ theme }) => theme.colors.neutral.light};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background-color: ${props => props.$selected ? props.theme.colors.primary.light : props.theme.colors.background.paper};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${({ theme }) => theme.colors.primary.main};
    }
`;

const SubmitButton = styled.button`
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${({ theme }) => theme.colors.primary.dark};
    }

    &:disabled {
        background-color: ${({ theme }) => theme.colors.neutral.light};
        cursor: not-allowed;
    }
`;

const KeyboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;
const KeyboardRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
`;
const KeyButton = styled.button`
  position: relative;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.04);
  min-width: 48px;
  min-height: 48px;
  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;
const KeyLabel = styled.span`
  position: absolute;
  top: 2px;
  left: 6px;
  font-size: 0.7em;
  color: ${({ theme }) => theme.colors.neutral.main};
  font-weight: 400;
`;

// Add a theme-aware Box for typing/text exercises
const ThemedBox = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

// Utility to normalize Korean answers
function normalizeKorean(text) {
  return text
    .normalize('NFC')
    .replace(/[.,!?\[\](){}]/g, '') // Remove common punctuation
    .replace(/\s+/g, ' ') // Replace multiple spaces with one
    .trim() // Trim leading/trailing spaces
    .toLowerCase(); // Ignore case
}

const ExerciseRenderer = ({ exercise, onSubmit, isSubmitting }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [processedOptions, setProcessedOptions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state when exercise changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setIsSubmitted(false);
  }, [exercise]);

  // Process exercise data
  useEffect(() => {
    if (!exercise) {
      console.error('Exercise data is missing');
      return;
    }

    let options = exercise.options;
    
    // If options is a string, try to parse it
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch (e) {
        console.error('Failed to parse options string:', e);
        options = [];
      }
    }

    // Convert object format to array format if needed
    if (options && typeof options === 'object' && !Array.isArray(options)) {
      options = Object.entries(options).map(([id, text]) => ({
        id,
        text: String(text)
      }));
    }

    // Ensure options is an array
    if (!Array.isArray(options)) {
      console.error('Failed to process options:', options);
      options = [];
    }

    setProcessedOptions(options);
  }, [exercise]);

  const handleSubmit = () => {
    if (!selectedAnswer || isSubmitted || isSubmitting) return;

    const correct = selectedAnswer === exercise.correct_answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setIsSubmitted(true);
    onSubmit(selectedAnswer);
  };

  const renderExercise = () => {
    if (!exercise) {
      return <div>No exercise data available</div>;
    }

    // Get the prompt text, handling both field names
    const promptText = exercise.prompt || exercise.question || 'No question prompt available';

    // Log exercise data for debugging
    console.log('Exercise data:', {
      type: exercise.type,
      prompt: promptText,
      options: processedOptions,
      correct_answer: exercise.correct_answer
    });

    switch (exercise.type) {
      case 'multiple_choice':
        if (processedOptions.length === 0) {
          return <div>No options available for this exercise</div>;
        }

        return (
          <>
            <Question>{promptText}</Question>
            <OptionsContainer>
              {processedOptions.map((option) => (
                <OptionButton
                  key={option.id}
                  $selected={selectedAnswer === option.id}
                  onClick={() => !isSubmitted && !isSubmitting && setSelectedAnswer(option.id)}
                  disabled={isSubmitted || isSubmitting}
                  $correct={selectedAnswer === exercise.correct_answer}
                  $incorrect={selectedAnswer !== exercise.correct_answer}
                >
                  {option.text}
                </OptionButton>
              ))}
            </OptionsContainer>
            {!isSubmitted && (
              <SubmitButton
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </SubmitButton>
            )}
            {showFeedback && (
              <FeedbackMessage $type={isCorrect ? 'success' : 'error'}>
                {isCorrect ? (
                  <>
                    <CheckCircle size={24} />
                    Correct! {exercise.explanation}
                  </>
                ) : (
                  <>
                    <XCircle size={24} />
                    Incorrect. The correct answer is: {processedOptions.find(opt => opt.id === exercise.correct_answer)?.text}
                  </>
                )}
              </FeedbackMessage>
            )}
          </>
        );

      case 'matching':
        return (
          <>
            <Question>{exercise.prompt || 'No question prompt available'}</Question>
            <MatchingContainer>
              {processedOptions.map((option, index) => (
                <MatchingItem
                  key={index}
                  $selected={selectedAnswer[index] === option.id}
                  onClick={() => {
                    if (isSubmitted || isSubmitting) return;
                    const newAnswer = [...selectedAnswer];
                    newAnswer[index] = option.id;
                    setSelectedAnswer(newAnswer);
                  }}
                >
                  {option.text}
                </MatchingItem>
              ))}
            </MatchingContainer>
            {!isSubmitted && (
              <SubmitButton
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </SubmitButton>
            )}
            {showFeedback && (
              <FeedbackMessage $type={isCorrect ? 'success' : 'error'}>
                {isCorrect ? (
                  <>
                    <CheckCircle size={24} />
                    Correct! {exercise.explanation}
                  </>
                ) : (
                  <>
                    <XCircle size={24} />
                    Incorrect. The correct answer is: {processedOptions.find(opt => opt.id === exercise.correct_answer)?.text}
                  </>
                )}
              </FeedbackMessage>
            )}
          </>
        );

      case 'typing':
      case 'text':
        return (
          <>
            <Question>{exercise.prompt || 'No question prompt available'}</Question>
            <ThemedBox>
              <KoreanInput
                value={selectedAnswer}
                onChange={(value) => !isSubmitted && !isSubmitting && setSelectedAnswer(value)}
                placeholder="Type your answer here..."
                showKeyboard={!isSubmitted && !isSubmitting}
                disabled={isSubmitted || isSubmitting}
              />
            </ThemedBox>
            {!isSubmitted && (
              <SubmitButton
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </SubmitButton>
            )}
            {showFeedback && (
              <FeedbackMessage $type={isCorrect ? 'success' : 'error'}>
                {isCorrect ? (
                  <>
                    <CheckCircle size={24} />
                    Correct! {exercise.explanation}
                  </>
                ) : (
                  <>
                    <XCircle size={24} />
                    Incorrect. The correct answer is: {exercise.correct_answer}
                  </>
                )}
              </FeedbackMessage>
            )}
          </>
        );

      default:
        return <div>Unsupported exercise type</div>;
    }
  };

  const getDifficultyLabel = (difficulty) => {
    if (!difficulty) return 'Unknown';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <ExerciseContainer>
      {exercise && (
        <DifficultyBadge $difficulty={exercise.difficulty}>
          {getDifficultyLabel(exercise.difficulty)}
        </DifficultyBadge>
      )}
      {renderExercise()}
    </ExerciseContainer>
  );
};

export default ExerciseRenderer; 