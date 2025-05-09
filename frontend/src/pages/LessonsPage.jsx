import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/common/Button';
import LessonsGrid from '../components/lessons/LessonsGrid';
import { api } from '../utils/api';

const PageHeader = styled.div`
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
    padding: ${({ theme }) => theme.spacing['2xl']} 0;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    text-align: center;
`;

const PageTitle = styled.h1`
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    margin: 0;
    margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const PageDescription = styled.p`
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    max-width: 600px;
    margin: 0 auto;
    opacity: 0.9;
`;

const FiltersContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    flex-wrap: wrap;

    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const FilterButton = styled(Button)`
    min-width: 120px;
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
                const data = await api.get('/lessons');
                console.log('Fetched lessons:', data);
                if (Array.isArray(data)) {
                    // Ensure each lesson has an exercises array
                    const lessonsWithExercises = data.map(lesson => ({
                        ...lesson,
                        exercises: Array.isArray(lesson.exercises) ? lesson.exercises : [],
                    }));
                    setLessons(lessonsWithExercises);
                    setError(null);
                } else {
                    setError('Invalid data format received from server');
                }
            } catch (err) {
                setError('Failed to load lessons. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, []);

    const filteredLessons = lessons.filter(lesson => {
        if (!lesson) {
            return false;
        }
        
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
        <>
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
        </>
    );
};

export default LessonsPage; 