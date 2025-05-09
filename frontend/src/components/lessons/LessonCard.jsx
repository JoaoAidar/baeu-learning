import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import designSystem from '../../styles/designSystem';

const { colors, typography, spacing, borderRadius, shadows, transitions } = designSystem;

const Card = styled(Link)`
    display: block;
    background-color: ${colors.neutral.white};
    border-radius: ${borderRadius.lg};
    padding: ${spacing.lg};
    text-decoration: none;
    color: inherit;
    transition: all ${transitions.normal} ${transitions.easeInOut};
    border: 2px solid ${colors.primary.light};
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-4px);
        box-shadow: ${shadows.lg};
        border-color: ${colors.primary.main};
        background-color: ${colors.primary.light};

        .lesson-title {
            color: ${colors.primary.main};
        }

        .lesson-stats {
            color: ${colors.primary.dark};
        }
    }

    &:active {
        transform: translateY(-2px);
    }
`;

const Title = styled.h3`
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.xl};
    font-weight: ${typography.fontWeight.bold};
    margin-bottom: ${spacing.sm};
    color: ${colors.neutral.dark};
    transition: color ${transitions.normal} ${transitions.easeInOut};
`;

const Description = styled.p`
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.base};
    color: ${colors.neutral.medium};
    margin-bottom: ${spacing.md};
    line-height: ${typography.lineHeight.normal};
`;

const Stats = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: ${spacing.sm};
    border-top: 1px solid ${colors.primary.light};
    transition: color ${transitions.normal} ${transitions.easeInOut};
`;

const Stat = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
    font-size: ${typography.fontSize.sm};
    color: ${colors.neutral.medium};
    transition: color ${transitions.normal} ${transitions.easeInOut};

    ${Card}:hover & {
        color: ${colors.primary.dark};
    }
`;

const LessonCard = ({ lesson }) => {
    if (!lesson) {
        return null;
    }
    if (!lesson.id) {
        return null;
    }
    const exerciseCount = Array.isArray(lesson.exercises) ? lesson.exercises.length : 0;
    return (
        <Card to={`/lessons/${lesson.id}`}>
            <Title className="lesson-title">{lesson.title || 'Untitled Lesson'}</Title>
            <Description>{lesson.description || 'No description available'}</Description>
            <Stats className="lesson-stats">
                <Stat>
                    <span>Exercises: {exerciseCount}</span>
                </Stat>
                <Stat>
                    <span>Order: {lesson.order_index || 0}</span>
                </Stat>
            </Stats>
        </Card>
    );
};

export default LessonCard; 