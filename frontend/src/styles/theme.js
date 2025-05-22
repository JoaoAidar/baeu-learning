export const theme = {
  colors: {
    // Light mode
    light: {
      primary: {
        main: '#FF6B6B', // Warm coral
        light: '#FF8E8E',
        dark: '#E55A5A',
      },
      secondary: {
        main: '#4ECDC4', // Rich teal
        light: '#6ED7D0',
        dark: '#3DBBB3',
      },
      background: {
        default: '#FFFFFF',
        paper: '#F8F9FA',
        elevated: '#FFFFFF',
      },
      text: {
        primary: '#2D3436',
        secondary: '#636E72',
        disabled: '#B2BEC3',
      },
      border: '#DFE6E9',
    },
    // Dark mode
    dark: {
      primary: {
        main: '#FF6B6B',
        light: '#FF8E8E',
        dark: '#E55A5A',
      },
      secondary: {
        main: '#4ECDC4',
        light: '#6ED7D0',
        dark: '#3DBBB3',
      },
      background: {
        default: '#1A1A1A',
        paper: '#2D2D2D',
        elevated: '#363636',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B2BEC3',
        disabled: '#636E72',
      },
      border: '#404040',
    },
  },
  typography: {
    fontFamily: {
      heading: 'Poppins, sans-serif',
      body: 'Inter, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}; 