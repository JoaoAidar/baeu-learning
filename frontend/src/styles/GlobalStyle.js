import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    background-color: ${({ theme }) => theme.colors.background.default};
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    overflow-x: hidden;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.typography.fontFamily.heading};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
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
    border-radius: ${({ theme }) => theme.borderRadius.md};
    
    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: 2px;
    }
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    
    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: 2px;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Responsive container utility */
  .container {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
    
    @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
      padding: 0 1.5rem;
    }
    
    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
      padding: 0 2rem;
    }
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