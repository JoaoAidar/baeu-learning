import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: #d62828;
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: #991b1b;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
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

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme, $color }) => theme.colors[$color]};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    color: #023e8a;
    background-color: ${({ theme }) => theme.colors.background.default};
    transform: scale(1.1);
  }

  &:focus {
    outline: none;
    color: #023e8a;
    box-shadow: 0 0 0 2px rgba(2, 62, 138, 0.2);
  }
`;

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await api.get('/admin/lessons-simple');
      setLessons(response);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await api.delete(`/admin/lessons/${id}`);
        fetchLessons();
      } catch (error) {
        console.error('Error deleting lesson:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Header>
        <Title>Lessons Management</Title>
        <Button>
          <Plus size={20} />
          Add New Lesson
        </Button>
      </Header>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Order Index</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <tbody>
          {lessons.map((lesson) => (
            <TableRow key={lesson.id}>
              <TableCell>{lesson.title}</TableCell>
              <TableCell>{lesson.description}</TableCell>
              <TableCell>{lesson.order_index}</TableCell>
              <TableCell>
                <ActionButton $color="primary">
                  <Edit size={18} />
                </ActionButton>
                <ActionButton $color="error" onClick={() => handleDelete(lesson.id)}>
                  <Trash2 size={18} />
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Lessons; 