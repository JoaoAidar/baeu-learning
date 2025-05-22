import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, Filter } from 'lucide-react';
import Button from '../components/common/Button';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1;
  max-width: 400px;

  @media (max-width: 640px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.neutral.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const FilterButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const LessonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const LessonCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const LessonHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LessonIcon = styled(BookOpen)`
  color: ${({ theme }) => theme.colors.primary.main};
`;

const LessonTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const LessonDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.neutral.light};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const Progress = styled.div`
  width: ${props => props.$progress}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  transition: width 0.3s ease;
`;

const LessonFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DifficultyBadge = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background-color: ${props => {
    const t = props.theme;
    switch (props.$difficulty) {
      case 'beginner':
        return t.colors.success.light;
      case 'intermediate':
        return t.colors.warning.light;
      case 'advanced':
        return t.colors.error.light;
      default:
        return t.colors.neutral.light;
    }
  }};
  color: ${props => {
    const t = props.theme;
    switch (props.$difficulty) {
      case 'beginner':
        return t.colors.success.dark;
      case 'intermediate':
        return t.colors.warning.dark;
      case 'advanced':
        return t.colors.error.dark;
      default:
        return t.colors.text.primary;
    }
  }};
`;

const LoadingMessage = styled.div`
  text-align: center;
  margin: ${({ theme }) => theme.spacing.xl} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  margin: ${({ theme }) => theme.spacing.md} 0;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.error.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const LessonsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const { data: lessons, isLoading, error } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const response = await fetch('/api/lessons');
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      return response.json();
    }
  });

  const filteredLessons = lessons?.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || lesson.difficulty === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleLessonClick = (lessonId) => {
    navigate(`/lessons/${lessonId}`);
  };

  if (isLoading) {
    return <LoadingMessage>{t('lessons.loading')}</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{t('lessons.error')}</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>{t('lessons.title')}</Title>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder={t('lessons.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FilterButton
            variant="secondary"
            onClick={() => setSelectedLevel(selectedLevel === 'all' ? 'beginner' : 'all')}
          >
            <Filter size={20} />
            {t('lessons.filter')}
          </FilterButton>
        </SearchBar>
      </Header>

      <LessonsGrid>
        {filteredLessons?.map((lesson) => (
          <LessonCard
            key={lesson.id}
            onClick={() => handleLessonClick(lesson.id)}
          >
            <LessonHeader>
              <LessonIcon size={24} />
              <LessonTitle>{lesson.title}</LessonTitle>
            </LessonHeader>
            <LessonDescription>{lesson.description}</LessonDescription>
            <ProgressBar>
              <Progress $progress={lesson.progress || 0} />
            </ProgressBar>
            <LessonFooter>
              <DifficultyBadge $difficulty={lesson.difficulty}>
                {t(`lessons.difficulty.${lesson.difficulty}`)}
              </DifficultyBadge>
              <Button variant="primary">
                {lesson.progress > 0 ? t('lessons.continue') : t('lessons.start')}
              </Button>
            </LessonFooter>
          </LessonCard>
        ))}
      </LessonsGrid>
    </Container>
  );
};

export default LessonsPage; 