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
    display: inline-block;
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

const Option = styled.button`
    padding: clamp(${({ theme }) => theme.spacing.sm}, 3vw, ${({ theme }) => theme.spacing.xl});
    border: 2px solid ${({ theme }) => theme.colors.neutral.light};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background-color: ${props => props.$selected ? props.theme.colors.primary.light : props.theme.colors.background.paper};
    color: ${props => props.$selected ? props.theme.colors.primary.dark : props.theme.colors.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    font-size: clamp(${({ theme }) => theme.typography.fontSize.sm}, 2vw, ${({ theme }) => theme.typography.fontSize.md});
    width: 100%;

    &:hover {
        border-color: ${({ theme }) => theme.colors.primary.main};
        transform: translateY(-2px);
    }
`;

const Feedback = styled.div`
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    margin-top: ${({ theme }) => theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    background-color: ${props => props.$isCorrect ? props.theme.colors.success.light : props.theme.colors.error.light};
    color: ${props => props.$isCorrect ? props.theme.colors.success.dark : props.theme.colors.error.dark};
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
                <Option
                  key={option.id}
                  $selected={selectedAnswer === option.id}
                  onClick={() => !isSubmitted && !isSubmitting && setSelectedAnswer(option.id)}
                  disabled={isSubmitted || isSubmitting}
                >
                  {option.text}
                </Option>
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
              <Feedback $isCorrect={isCorrect}>
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
              </Feedback>
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
              <Feedback $isCorrect={isCorrect}>
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
              </Feedback>
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
              <Feedback $isCorrect={isCorrect}>
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
              </Feedback>
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