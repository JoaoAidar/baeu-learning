import React, { useState } from 'react';
import styled from 'styled-components';
import { api } from '../../utils/api';
import { Save } from 'lucide-react';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.neutral.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.default};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: #d62828;
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all 0.2s ease;
  align-self: flex-start;

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

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    maxLessonsPerDay: 5,
    enableNotifications: true
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/admin/settings', settings);
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Settings</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            type="text"
            id="siteName"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="siteDescription">Site Description</Label>
          <Input
            type="text"
            id="siteDescription"
            name="siteDescription"
            value={settings.siteDescription}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="maxLessonsPerDay">Maximum Lessons Per Day</Label>
          <Input
            type="number"
            id="maxLessonsPerDay"
            name="maxLessonsPerDay"
            value={settings.maxLessonsPerDay}
            onChange={handleChange}
            min="1"
            max="10"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <Input
              type="checkbox"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleChange}
            />
            Enable Notifications
          </Label>
        </FormGroup>

        <Button type="submit" disabled={loading}>
          <Save size={20} />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </Form>
    </Container>
  );
};

export default Settings; 