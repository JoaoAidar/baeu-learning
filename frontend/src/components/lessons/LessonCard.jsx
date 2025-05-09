import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import designSystem from '../../styles/designSystem';

const { colors, spacing, typography, borderRadius, shadows, transitions } = designSystem;

const Card = styled(Link)`
    display: block;
    background-color: ${colors.background.paper};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.sm};
    padding: ${spacing.xl};
    text-decoration: none;
    color: inherit;
    transition: all ${transitions.normal} ${transitions.easeInOut};
    border: 1px solid ${colors.neutral.light};

    &:hover {
        transform: translateY(-4px);
        box-shadow: ${shadows.md};
        border-color: ${colors.primary.main};
    }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing.md};
`;

const Title = styled.h3`
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.xl};
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.text.primary};
    margin: 0;
`;

const Difficulty = styled.span`
    font-family: ${typography.fontFamily.secondary};
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.medium};
    padding: ${spacing.xs} ${spacing.sm};
    border-radius: ${borderRadius.full};
    background-color: ${({ level }) => {
        switch (level) {
            case 'beginner':
                return colors.success.light;
            case 'intermediate':
                return colors.warning.light;
            case 'advanced':
                return colors.error.light;
            default:
                return colors.neutral.light;
        }
    }};
    color: ${({ level }) => {
        switch (level) {
            case 'beginner':
                return colors.success.main;
            case 'intermediate':
                return colors.warning.main;
            case 'advanced':
                return colors.error.main;
            default:
                return colors.neutral.dark;
        }
    }};
`;

const Description = styled.p`
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.md};
    color: ${colors.text.secondary};
    margin: 0 0 ${spacing.lg};
    line-height: ${typography.lineHeight.relaxed};
`;

const CardFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: ${spacing.md};
    border-top: 1px solid ${colors.neutral.light};
`;

const Category = styled.span`
    font-family: ${typography.fontFamily.secondary};
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
`;

const Progress = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
    font-family: ${typography.fontFamily.secondary};
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
`;

const ProgressBar = styled.div`
    width: 60px;
    height: 4px;
    background-color: ${colors.neutral.light};
    border-radius: ${borderRadius.full};
    overflow: hidden;
`;

const ProgressFill = styled.div`
    height: 100%;
    background-color: ${colors.success.main};
    width: ${({ value }) => `${value}%`};
    transition: width ${transitions.normal} ${transitions.easeInOut};
`;

const LessonCard = ({ lesson }) => {
    const {
        id,
        title,
        description,
        difficulty = 'beginner',
        category,
        progress = 0,
    } = lesson;

    return (
        <Card to={`/lessons/${id}`}>
            <CardHeader>
                <Title>{title}</Title>
                <Difficulty level={difficulty}>
                    {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Beginner'}
                </Difficulty>
            </CardHeader>
            <Description>{description}</Description>
            <CardFooter>
                <Category>{category || 'Uncategorized'}</Category>
                <Progress>
                    <ProgressBar>
                        <ProgressFill value={progress} />
                    </ProgressBar>
                    <span>{progress}%</span>
                </Progress>
            </CardFooter>
        </Card>
    );
};

export default LessonCard; 