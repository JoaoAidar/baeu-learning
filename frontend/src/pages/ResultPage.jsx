import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import designSystem from '../styles/designSystem';

const { colors, typography, spacing, borderRadius, shadows } = designSystem;

const ResultContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
`;

const ResultCard = styled(Card)`
    padding: ${spacing.xl};
`;

const Title = styled.h1`
    font-family: ${typography.fontFamily.secondary};
    font-size: ${typography.fontSize.xxl};
    color: ${colors.neutral.dark};
    margin-bottom: ${spacing.lg};
`;

const Subtitle = styled.h2`
    font-family: ${typography.fontFamily.secondary};
    font-size: ${typography.fontSize.xl};
    color: ${colors.neutral.medium};
    margin-bottom: ${spacing.xl};
`;

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${spacing.lg};
    margin: ${spacing.xl} 0;
`;

const StatItem = styled.div`
    padding: ${spacing.lg};
    background-color: ${colors.neutral.light};
    border-radius: ${borderRadius.lg};
`;

const StatValue = styled.div`
    font-size: ${typography.fontSize.xxl};
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.primary.main};
    margin-bottom: ${spacing.xs};
`;

const StatLabel = styled.div`
    font-size: ${typography.fontSize.sm};
    color: ${colors.neutral.medium};
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: ${spacing.md};
    justify-content: center;
    margin-top: ${spacing.xl};
`;

const ResultPage = () => {
    const navigate = useNavigate();

    // Mock data - replace with actual data from your state management
    const stats = {
        correctAnswers: 8,
        totalQuestions: 10,
        timeSpent: '5:30',
        streak: 3
    };

    const percentage = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

    return (
        <Layout>
            <ResultContainer>
                <ResultCard>
                    <Title>Lesson Complete!</Title>
                    <Subtitle>Great job on completing the lesson</Subtitle>

                    <StatsContainer>
                        <StatItem>
                            <StatValue>{percentage}%</StatValue>
                            <StatLabel>Accuracy</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{stats.correctAnswers}/{stats.totalQuestions}</StatValue>
                            <StatLabel>Correct Answers</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{stats.timeSpent}</StatValue>
                            <StatLabel>Time Spent</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatValue>{stats.streak}</StatValue>
                            <StatLabel>Day Streak</StatLabel>
                        </StatItem>
                    </StatsContainer>

                    <ButtonContainer>
                        <Button
                            $variant="secondary"
                            onClick={() => navigate('/lessons')}
                        >
                            Back to Lessons
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                        >
                            Continue Learning
                        </Button>
                    </ButtonContainer>
                </ResultCard>
            </ResultContainer>
        </Layout>
    );
};

export default ResultPage; 