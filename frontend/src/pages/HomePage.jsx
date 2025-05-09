import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { api } from '../utils/api';

const Container = styled.div`
    max-width: 1440px;
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing.xl};
    
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

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        flex-direction: column;
        gap: ${({ theme }) => theme.spacing.md};
        align-items: flex-start;
    }
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
`;

const LogoutButton = styled.button`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.error.main};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    cursor: pointer;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    transition: background-color 0.2s;

    &:hover {
        background-color: ${({ theme }) => theme.colors.error.dark};
    }
`;

const LessonsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: ${({ theme }) => theme.spacing.lg};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: ${({ theme }) => theme.spacing.md};
    }
    
    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
        grid-template-columns: 1fr;
    }
`;

const LessonCard = styled.div`
    background-color: ${({ theme }) => theme.colors.background.paper};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.lg};
    box-shadow: ${({ theme }) => theme.shadows.md};
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: ${({ theme }) => theme.shadows.lg};
    }
`;

const LessonTitle = styled.h2`
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        font-size: ${({ theme }) => theme.typography.fontSize.md};
    }
`;

const LessonDescription = styled.p`
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background-color: ${({ theme }) => theme.colors.neutral.light};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    overflow: hidden;
`;

const Progress = styled.div`
    width: ${props => props.$progress}%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.primary.main};
    transition: width 0.3s ease;
`;

const ErrorMessage = styled.div`
    color: ${({ theme }) => theme.colors.error.main};
    margin: ${({ theme }) => theme.spacing.md} 0;
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.error.light};
    border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const LoadingMessage = styled.div`
    text-align: center;
    margin: ${({ theme }) => theme.spacing.xl} 0;
    color: ${({ theme }) => theme.colors.text.secondary};
`;

const HomePage = () => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserAndLessons = async () => {
            try {
                // Fetch user data
                const userData = await api.get('/auth/me');
                setUser(userData);

                // Fetch lessons
                const lessonsData = await api.get('/lessons');
                setLessons(lessonsData);
                setError(null);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndLessons();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleLessonClick = (lessonId) => {
        navigate(`/lesson/${lessonId}`);
    };

    if (loading) {
        return <LoadingMessage>Loading lessons...</LoadingMessage>;
    }

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    return (
        <Container>
            <Header>
                <Title>Welcome, {user?.username || 'User'}!</Title>
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </Header>
            <LessonsGrid>
                {lessons.map((lesson) => (
                    <LessonCard
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id)}
                    >
                        <LessonTitle>{lesson.title}</LessonTitle>
                        <LessonDescription>{lesson.description}</LessonDescription>
                        <ProgressBar>
                            <Progress $progress={lesson.progress || 0} />
                        </ProgressBar>
                    </LessonCard>
                ))}
            </LessonsGrid>
        </Container>
    );
};

export default HomePage; 