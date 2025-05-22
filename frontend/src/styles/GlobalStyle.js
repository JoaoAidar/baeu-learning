import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    background-color: ${({ theme }) => theme.colors.background.default};
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.primary.main};
    transition: color ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary.dark};
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    transition: all ${({ theme }) => theme.transitions.fast};
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral.light};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral.dark};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary.main};
  }
`;

export default GlobalStyle; 