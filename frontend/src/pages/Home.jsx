import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { api } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import LessonCard from '../components/lessons/LessonCard';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeSection = styled.section`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

const LessonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.error.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const Home = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setError(null);
        const response = await api.get('/lessons');
        setLessons(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setError('Failed to load lessons. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (!user) {
    return (
      <HomeContainer>
        <WelcomeSection>
          <Title>Welcome to BAEU Learning</Title>
          <Subtitle>
            Master English and Korean with our interactive lessons and exercises. Start your language learning journey today!
          </Subtitle>
          <div style={{ marginTop: 32 }}>
            <Link to="/login" style={{ marginRight: 16, fontWeight: 'bold' }}>Log In</Link>
            <Link to="/register" style={{ fontWeight: 'bold' }}>Register</Link>
          </div>
          <div style={{ marginTop: 48, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', color: '#666', fontSize: 18 }}>
            <p><b>About the Project:</b> BAEU Learning is a modern web platform for learning Korean and English, featuring interactive lessons, progress tracking, and a friendly community. Whether you're a beginner or looking to improve, our resources are designed for you!</p>
          </div>
        </WelcomeSection>
      </HomeContainer>
    );
  }

  if (loading) {
    return (
      <LoadingContainer>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <HomeContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <WelcomeSection>
        <Title>Welcome to BAEU Learning</Title>
        <Subtitle>
          Master English and Korean with our interactive lessons and exercises.
          Start your language learning journey today!
        </Subtitle>
      </WelcomeSection>

      <LessonsGrid>
        {lessons && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))
        ) : (
          <ErrorMessage>No lessons available at the moment.</ErrorMessage>
        )}
      </LessonsGrid>
    </HomeContainer>
  );
};

export default Home; 