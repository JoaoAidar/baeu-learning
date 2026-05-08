import React from 'react';
import styled from 'styled-components';
import { Container } from '../styles/designSystem';

const Heading = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SubHeading = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Text = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const List = styled.ul`
  padding-left: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ListItem = styled.li`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const AboutProject = () => (
  <Container>
    <Heading>About the Project</Heading>
    <Text>
      <b>BeaU Learning</b> is a web application designed to help learners master the Korean language in a practical and interactive way. The project was born from a passion for language learning and a desire to make Korean more accessible to everyone, regardless of their background or previous experience.
    </Text>
    <SubHeading>Motivations</SubHeading>
    <List>
      <ListItem>• To provide a modern, user-friendly platform for learning Korean.</ListItem>
      <ListItem>• To bridge the gap between theory and practice with interactive exercises.</ListItem>
      <ListItem>• To support learners with tools like a visual keyboard and tolerant answer checking.</ListItem>
      <ListItem>• To encourage consistent practice and track progress over time.</ListItem>
    </List>
    <SubHeading>Insights</SubHeading>
    <List>
      <ListItem>• Real learning happens through active engagement and feedback.</ListItem>
      <ListItem>• Small usability details (like tolerant answer checking and visual aids) make a big difference in user motivation.</ListItem>
      <ListItem>• Technology can make language learning more inclusive and enjoyable for everyone.</ListItem>
    </List>
  </Container>
);

export default AboutProject; 