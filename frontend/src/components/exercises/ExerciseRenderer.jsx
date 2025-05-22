import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CheckCircle, XCircle } from 'lucide-react';
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

const ExerciseWrapper = styled.div`
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

const AnswerContainer = styled.div`
    margin-top: ${({ theme }) => theme.spacing.xl};
`;

const AnswerInput = styled.input`
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    border: 2px solid ${({ theme }) => theme.colors.neutral.main};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    background-color: ${({ theme }) => theme.colors.background.default};
    color: ${({ theme }) => theme.colors.text.primary};
    transition: all ${({ theme }) => theme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary.main};
        box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light}40;
    }

    &:disabled {
        background-color: ${({ theme }) => theme.colors.neutral.light};
        cursor: not-allowed;
    }
`;

const FeedbackMessage = styled.div`
    margin-top: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    
    ${props => {
        const t = props.theme;
        if (props.$isCorrect) {
            return `
                background-color: ${t.colors.success.light};
                color: ${t.colors.success.dark};
            `;
        }
        return `
            background-color: ${t.colors.error.light};
            color: ${t.colors.error.dark};
        `;
    }}
`;

const SubmitButton = styled.button`
    margin-top: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.normal};

    &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.primary.dark};
        transform: translateY(-1px);
    }

    &:disabled {
        background-color: ${({ theme }) => theme.colors.neutral.main};
        cursor: not-allowed;
    }
`;

const MultipleChoiceContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
    margin-top: ${({ theme }) => theme.spacing.lg};
`;

const OptionButton = styled.button`
    width: 100%;
    text-align: left;
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${props => 
        props.$isSelected 
            ? props.theme.colors.primary.light 
            : props.theme.colors.background.default
    };
    border: 2px solid ${props => 
        props.$isSelected 
            ? props.theme.colors.primary.main 
            : props.theme.colors.neutral.main
    };
    border-radius: ${({ theme }) => theme.borderRadius.md};
    color: ${props => 
        props.$isSelected 
            ? props.theme.colors.primary.dark
            : props.theme.colors.text.primary
    };
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.normal};

    &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.primary.light}40;
        border-color: ${({ theme }) => theme.colors.primary.main};
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

const ExerciseContainer = styled.div`
    background-color: ${({ theme }) => theme.colors.background.paper};
    padding: ${({ theme }) => theme.spacing.xl};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    box-shadow: ${({ theme }) => theme.shadows.md};
`;

const ExerciseRenderer = ({ exercise, onSubmit, isSubmitting }) => {
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    console.log('Exercise data:', exercise);

    // Format question text similar to options
    const formatQuestion = (question) => {
        if (typeof question === 'string') return question;
        if (typeof question === 'object' && question !== null) {
            if (question.text) return question.text;
            if (question.value) return question.value;
        }
        console.warn('Invalid question format:', question);
        return 'Question not available';
    };

    const handleSubmitAnswer = async () => {
        if (isSubmitting || !answer) return;
        
        // For multiple choice, use selectedOption as answer
        const submittedAnswer = exercise.type === 'multiple_choice' 
            ? selectedOption 
            : answer;

        try {
            await onSubmit(submittedAnswer);
            setFeedback({ isCorrect: true, message: 'Correct! Well done!' });
        } catch (error) {
            setFeedback({ 
                isCorrect: false, 
                message: error.response?.data?.message || 'Incorrect. Try again!' 
            });
        }
    };

    const renderAnswerInput = () => {
        if (!exercise?.options) {
            console.warn('Exercise options missing:', exercise);
            return null;
        }

        // Ensure options are properly formatted
        const formatOption = (opt) => {
            if (typeof opt === 'string') return opt;
            if (typeof opt === 'object' && opt !== null) {
                if (opt.text) return opt.text;
                if (opt.id) return opt.id;
            }
            console.warn('Invalid option format:', opt);
            return '';
        };

        switch (exercise.type) {
            case 'multiple_choice':
                return (
                    <MultipleChoiceContainer>
                        {exercise.options.map((option, index) => {
                            const optionText = formatOption(option);
                            return (
                                <OptionButton
                                    key={index}
                                    $isSelected={selectedOption === optionText}
                                    onClick={() => setSelectedOption(optionText)}
                                    disabled={isSubmitting}
                                >
                                    {optionText}
                                </OptionButton>
                            );
                        })}
                    </MultipleChoiceContainer>
                );
            case 'korean_input':
                return (
                    <KoreanInput
                        value={answer}
                        onChange={setAnswer}
                        disabled={isSubmitting}
                        placeholder="Type your answer in Korean..."
                    />
                );
            default:
                return (
                    <AnswerInput
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Type your answer..."
                    />
                );
        }
    };

    return (
        <ExerciseWrapper>
            <DifficultyBadge $difficulty={exercise.difficulty || 'medium'}>
                {exercise.difficulty?.charAt(0).toUpperCase() + exercise.difficulty?.slice(1) || 'Medium'}
            </DifficultyBadge>
            
            <div className="exercise-container">
                <div className="question-container">
                    <Question text={formatQuestion(exercise.prompt)} />
                </div>
            </div>
            
            <AnswerContainer>
                {renderAnswerInput()}
            </AnswerContainer>

            {feedback && (
                <FeedbackMessage $isCorrect={feedback.isCorrect}>
                    {feedback.isCorrect ? (
                        <CheckCircle size={20} />
                    ) : (
                        <XCircle size={20} />
                    )}
                    {feedback.message}
                </FeedbackMessage>
            )}
            
            <SubmitButton
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || (!answer && !selectedOption)}
            >
                {isSubmitting ? 'Checking...' : 'Submit Answer'}
            </SubmitButton>
        </ExerciseWrapper>
    );
};

export default ExerciseRenderer;