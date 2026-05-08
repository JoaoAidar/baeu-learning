import React from 'react';
import styled from 'styled-components';
import { Container } from '../styles/designSystem';

const Heading = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Text = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AboutMe = () => (
  <Container>
    <Heading>About Me</Heading>
    <Text>
      [Content to be added soon.]
    </Text>
  </Container>
);

export default AboutMe; 