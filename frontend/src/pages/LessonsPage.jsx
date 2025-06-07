import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/common/Button';
import LessonsGrid from '../components/lessons/LessonsGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import { api } from '../utils/api';
import designSystem from '../styles/designSystem';

const { colors, spacing, typography, borderRadius, shadows, transitions } = designSystem;

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: ${spacing.xl};
`;

const PageHeader = styled.div`
    background-color: ${colors.background.paper};
    color: ${colors.text.primary};
    padding: ${spacing['2xl']} 0;
    margin-bottom: ${spacing.xl};
    text-align: center;
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.md};
`;

const PageTitle = styled.h1`
    font-family: ${typography.fontFamily.secondary};
    font-size: ${typography.fontSize['4xl']};
    margin: 0;
    margin-bottom: ${spacing.md};
    color: ${colors.text.primary};
`;

const PageDescription = styled.p`
    font-size: ${typography.fontSize.lg};
    max-width: 600px;
    margin: 0 auto;
    opacity: 0.9;
    color: ${colors.text.secondary};
`;

const FiltersContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: ${spacing.md};
    margin-bottom: ${spacing.xl};
    flex-wrap: wrap;
    padding: ${spacing.lg};
    background-color: ${colors.background.paper};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.sm};

    @media (max-width: ${designSystem.breakpoints.sm}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const FilterButton = styled(Button)`
    min-width: 120px;
    transition: all ${transitions.normal} ${transitions.easeInOut};

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${shadows.md};
    }
`;

const LessonsPage = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setLoading(true);
                const response = await api.get('/lessons');
                const data = response.data;
                const lessonsArray = Array.isArray(data) ? data : Object.values(data);
                const lessonsWithExercises = lessonsArray.map(lesson => ({
                    ...lesson,
                    exercises: Array.isArray(lesson.exercises) ? lesson.exercises : [],
                }));
                setLessons(lessonsWithExercises);
                setError(null);
            } catch (err) {
                console.error('Error fetching lessons:', err);
                setError('Failed to load lessons. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    if (loading) {
        return (
            <Container>
                <LoadingSpinner message="Loading lessons..." size={32} />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <AlertMessage 
                    type="error" 
                    message={error} 
                    onClose={() => setError(null)}
                />
            </Container>
        );
    }

    const filteredLessons = lessons.filter(lesson => {
        if (!lesson) return false;
        
        const exerciseCount = lesson.exercises?.length || 0;
        const completedCount = lesson.exercises?.filter(ex => ex.completed)?.length || 0;

        switch (filter) {
            case 'completed':
                return completedCount === exerciseCount && exerciseCount > 0;
            case 'in-progress':
                return completedCount > 0 && completedCount < exerciseCount;
            case 'not-started':
                return completedCount === 0;
            default:
                return true;
        }
    });

    return (
        <Container>
            <PageHeader>
                <PageTitle>Korean Lessons</PageTitle>
                <PageDescription>
                    Start your journey to learn Korean with our interactive lessons.
                    Each lesson includes exercises to help you practice and improve.
                </PageDescription>
            </PageHeader>

            <FiltersContainer>
                <FilterButton
                    $variant={filter === 'all' ? 'secondary' : 'primary'}
                    onClick={() => setFilter('all')}
                >
                    All Lessons
                </FilterButton>
                <FilterButton
                    $variant={filter === 'not-started' ? 'secondary' : 'primary'}
                    onClick={() => setFilter('not-started')}
                >
                    Not Started
                </FilterButton>
                <FilterButton
                    $variant={filter === 'in-progress' ? 'secondary' : 'primary'}
                    onClick={() => setFilter('in-progress')}
                >
                    In Progress
                </FilterButton>
                <FilterButton
                    $variant={filter === 'completed' ? 'secondary' : 'primary'}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </FilterButton>
            </FiltersContainer>

            <LessonsGrid
                lessons={filteredLessons}
                loading={loading}
                error={error}
            />
        </Container>
    );
};

export default LessonsPage;