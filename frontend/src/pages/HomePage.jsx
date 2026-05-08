import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { api } from '../utils/api';
import { BookOpen, LogOut, MessageCircle, Award } from 'lucide-react';

const Container = styled.div`
    max-width: 1440px;
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing[8]};
    min-height: 100vh;
    background-color: ${({ theme }) => theme.colors.background.default};
    
    /* Tailwind equivalent: xl:px-8 lg:px-6 md:px-4 sm:px-3 px-4 */
    @media (max-width: 1280px) {
        padding: ${({ theme }) => theme.spacing[6]};
    }
    
    @media (max-width: 1024px) {
        padding: ${({ theme }) => theme.spacing[5]};
    }
    
    @media (max-width: 768px) {
        padding: ${({ theme }) => theme.spacing[4]};
    }
    
    @media (max-width: 640px) {
        padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[3]};
    }
`;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${({ theme }) => theme.spacing[8]};
    padding-bottom: ${({ theme }) => theme.spacing[6]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.main};
    gap: ${({ theme }) => theme.spacing[4]};
    
    /* Tailwind equivalent: md:flex-row md:items-center md:gap-0 flex-col items-start gap-4 */
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${({ theme }) => theme.spacing[6]};
        margin-bottom: ${({ theme }) => theme.spacing[6]};
        padding-bottom: ${({ theme }) => theme.spacing[4]};
    }
    
    @media (max-width: 640px) {
        margin-bottom: ${({ theme }) => theme.spacing[5]};
        padding-bottom: ${({ theme }) => theme.spacing[3]};
    }
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const Title = styled.h1`
    font-family: ${({ theme }) => theme.typography.fontFamily.heading};
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    line-height: 1.2;
    
    /* Tailwind equivalent: lg:text-3xl md:text-2xl text-xl */
    @media (max-width: 1024px) {
        font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    }
    
    @media (max-width: 768px) {
        font-size: ${({ theme }) => theme.typography.fontSize.xl};
        margin-bottom: ${({ theme }) => theme.spacing[3]};
    }
    
    @media (max-width: 640px) {
        font-size: ${({ theme }) => theme.typography.fontSize.lg};
        text-align: center;
    }
`;

const Subtitle = styled.p`
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-top: ${({ theme }) => theme.spacing[2]};
    line-height: 1.5;
    
    /* Tailwind equivalent: md:text-lg text-base */
    @media (max-width: 768px) {
        font-size: ${({ theme }) => theme.typography.fontSize.base};
        text-align: center;
    }
    
    @media (max-width: 640px) {
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
`;

const UserStats = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[6]};
    margin-top: ${({ theme }) => theme.spacing[4]};
    
    /* Tailwind equivalent: lg:flex-row lg:gap-6 md:grid md:grid-cols-2 md:gap-4 flex-col gap-3 */
    @media (max-width: 1024px) {
        gap: ${({ theme }) => theme.spacing[4]};
    }
    
    @media (max-width: 768px) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: ${({ theme }) => theme.spacing[3]};
        margin-top: ${({ theme }) => theme.spacing[6]};
    }
    
    @media (max-width: 640px) {
        grid-template-columns: 1fr;
        gap: ${({ theme }) => theme.spacing[3]};
        margin-top: ${({ theme }) => theme.spacing[4]};
    }
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    background-color: ${({ theme }) => theme.colors.background.paper};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 1px solid ${({ theme }) => theme.colors.neutral.main};
    min-width: 0;
    flex: 1;
    
    /* Tailwind equivalent: md:p-3 p-2 md:text-sm text-xs */
    @media (max-width: 768px) {
        padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        gap: ${({ theme }) => theme.spacing[1]};
    }
    
    @media (max-width: 640px) {
        justify-content: center;
        text-align: center;
        flex-direction: column;
        gap: ${({ theme }) => theme.spacing[1]};
        padding: ${({ theme }) => theme.spacing[3]};
    }
`;

const LessonsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: ${({ theme }) => theme.spacing[6]};
    
    /* Tailwind equivalent: xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 grid-cols-1 */
    @media (max-width: 1280px) {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: ${({ theme }) => theme.spacing[5]};
    }
    
    @media (max-width: 1024px) {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: ${({ theme }) => theme.spacing[4]};
    }
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${({ theme }) => theme.spacing[4]};
    }
    
    @media (max-width: 640px) {
        gap: ${({ theme }) => theme.spacing[3]};
    }
`;

const LessonCard = styled.div`
    position: relative;
    background-color: ${({ theme }) => theme.colors.background.paper};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    padding: ${({ theme }) => theme.spacing[6]};
    box-shadow: ${({ theme }) => theme.shadows.md};
    cursor: pointer;
    transition: ${({ theme }) => theme.transitions.default};
    border: 1px solid ${({ theme }) => theme.colors.neutral.main};
    overflow: hidden;

    &:hover {
        transform: translateY(-4px);
        box-shadow: ${({ theme }) => theme.shadows.lg};
        border-color: ${({ theme }) => theme.colors.primary.main};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${({ theme }) => theme.colors.primary.main};
        transform: scaleX(${props => (props.$progress || 0) / 100});
        transform-origin: left;
        transition: transform 0.3s ease;
    }
`;

const LessonTitle = styled.h2`
    font-family: ${({ theme }) => theme.typography.fontFamily.heading};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const LessonDescription = styled.p`
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const LessonProgress = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ProgressBar = styled.div`
    flex: 1;
    height: 6px;
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

const LessonStatus = styled.span`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.primary.main};
`;

const LogoutButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.secondary};
    border: 1px solid ${({ theme }) => theme.colors.neutral.main};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    transition: ${({ theme }) => theme.transitions.default};
    cursor: pointer;
    white-space: nowrap;

    &:hover {
        background-color: #d62828;
        color: #ffffff;
        border-color: #d62828;
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.2);
    }
    
    /* Tailwind equivalent: md:w-auto w-full md:justify-start justify-center */
    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
        padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
        order: 1;
    }
    
    @media (max-width: 640px) {
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    }
`;

const ErrorMessage = styled.div`
    color: ${({ theme }) => theme.colors.error.main};
    padding: ${({ theme }) => theme.spacing[4]};
    background-color: ${({ theme }) => theme.colors.error.light};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    margin-top: ${({ theme }) => theme.spacing[4]};
    text-align: center;
`;

const LoadingMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
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
                const userData = await api.get('/auth/me');
                setUser(userData);

                const lessonsData = await api.get('/lessons');
                console.log('Fetched lessonsData:', lessonsData);
                // Defensive: handle both array and object with array property
                let lessonsArr = Array.isArray(lessonsData)
                    ? lessonsData
                    : Array.isArray(lessonsData?.lessons)
                        ? lessonsData.lessons
                        : [];
                setLessons(lessonsArr);
                setError(null);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error('Error fetching data:', err);
                navigate('/signup'); // Redirect to register if not authenticated
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
    };    const handleLessonClick = (lessonId) => {
        navigate(`/lessons/${lessonId}`);
    };

    if (loading) {
        return <LoadingMessage>Loading your Korean learning journey...</LoadingMessage>;
    }

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    const completedLessons = lessons.filter(l => l.progress === 100).length;
    const inProgressLessons = lessons.filter(l => l.progress > 0 && l.progress < 100).length;

    return (
        <Container>
            <Header>
                <HeaderContent>
                    <Title>안녕하세요, {user?.username || 'User'}!</Title>
                    <Subtitle>Continue your Korean learning journey</Subtitle>
                    <UserStats>
                        <StatItem>
                            <BookOpen size={16} />
                            {lessons.length} Total Lessons
                        </StatItem>
                        <StatItem>
                            <MessageCircle size={16} />
                            {inProgressLessons} In Progress
                        </StatItem>
                        <StatItem>
                            <Award size={16} />
                            {completedLessons} Completed
                        </StatItem>
                    </UserStats>
                </HeaderContent>
                <LogoutButton onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                </LogoutButton>
            </Header>
            <LessonsGrid>
                {lessons.map((lesson) => (
                    <LessonCard
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id)}
                        $progress={lesson.progress || 0}
                    >
                        <LessonTitle>{lesson.title}</LessonTitle>
                        <LessonDescription>{lesson.description}</LessonDescription>
                        <LessonProgress>
                            <ProgressBar>
                                <Progress $progress={lesson.progress || 0} />
                            </ProgressBar>
                            <LessonStatus>
                                {lesson.progress === 100 ? 'Completed' : 
                                 lesson.progress > 0 ? `${lesson.progress}%` : 
                                 'Start Learning'}
                            </LessonStatus>
                        </LessonProgress>
                    </LessonCard>
                ))}
            </LessonsGrid>
        </Container>
    );
};

export default HomePage;