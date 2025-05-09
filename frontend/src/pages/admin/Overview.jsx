import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../../utils/api';
import { Users, BookOpen, Award, Clock } from 'lucide-react';

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
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

const Section = styled.div`
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.light};

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Overview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLessons: 0,
    totalExercises: 0,
    totalProgress: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsResponse, usersResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users/recent')
        ]);

        setStats(statsResponse.data || {
          totalUsers: 0,
          totalLessons: 0,
          totalExercises: 0,
          totalProgress: 0
        });
        
        setRecentUsers(usersResponse.data || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin data');
        // Set default values
        setStats({
          totalUsers: 0,
          totalLessons: 0,
          totalExercises: 0,
          totalProgress: 0
        });
        setRecentUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <OverviewContainer>
      <StatsGrid>
        <StatCard>
          <StatIcon $color="#2196F3">
            <Users size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#4CAF50">
            <BookOpen size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalLessons}</StatValue>
            <StatLabel>Total Lessons</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#FF9800">
            <Award size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalExercises}</StatValue>
            <StatLabel>Total Exercises</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#9C27B0">
            <Clock size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalProgress}</StatValue>
            <StatLabel>Total Progress</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Recent Users</SectionTitle>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Username</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Joined</TableHeader>
              <TableHeader>Role</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {recentUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Section>
    </OverviewContainer>
  );
};

export default Overview; 