import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../utils/api';
import { Award, BookOpen, Clock, Target } from 'lucide-react';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: ${({ theme }) => theme.spacing.xl} auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ProfileHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const Username = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Email = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RecentActivity = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background.default};

  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral.light};
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ActivityTime = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({
    completedLessons: 0,
    totalExercises: 0,
    correctAnswers: 0,
    timeSpent: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/user/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const activityResponse = await api.get('/users/profile/activity');
        setRecentActivity(activityResponse.data);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Username>{user.username}</Username>
        <Email>{user.email}</Email>
      </ProfileHeader>      <StatsGrid>
        <StatCard>
          <StatIcon $color="#d62828">
            <BookOpen size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.completedLessons}</StatValue>
            <StatLabel>Completed Lessons</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#023e8a">
            <Award size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalExercises}</StatValue>
            <StatLabel>Total Exercises</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#f59e0b">
            <Clock size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.timeSpent}</StatValue>
            <StatLabel>Time Spent (minutes)</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#10b981">
            <Target size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.correctAnswers}</StatValue>
            <StatLabel>Correct Answers</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <RecentActivity>
        <SectionTitle>Recent Activity</SectionTitle>
        <ActivityList>
          {recentActivity.map((activity, index) => (
            <ActivityItem key={index}>
              <ActivityContent>
                <ActivityTitle>{activity.title}</ActivityTitle>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          ))}
        </ActivityList>
      </RecentActivity>
    </ProfileContainer>
  );
};

export default Profile; 