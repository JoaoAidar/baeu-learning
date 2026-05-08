export const theme = {
  colors: {
    // Light mode
    light: {
      primary: {
        main: '#d62828', // Primary red accent
        light: '#f87171',
        dark: '#991b1b',
        contrast: '#ffffff',
      },
      secondary: {
        main: '#023e8a', // Secondary blue accent
        light: '#60a5fa',
        dark: '#1e3a8a',
        contrast: '#ffffff',
      },
      background: {
        default: '#f8f9fa', // Base background color
        paper: '#ffffff',
        elevated: '#ffffff',
      },
      text: {
        primary: '#202124',
        secondary: '#5f6368',
        disabled: '#9aa0a6',
      },
      border: '#e8eaed',
    },
    // Dark mode
    dark: {
      primary: {
        main: '#f87171', // Lighter red for dark mode
        light: '#fca5a5',
        dark: '#dc2626',
      },
      secondary: {
        main: '#60a5fa', // Lighter blue for dark mode
        light: '#93c5fd',
        dark: '#1d4ed8',
      },
      background: {
        default: '#111827',
        paper: '#1f2937',
        elevated: '#374151',
      },
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        disabled: '#9ca3af',
      },
      border: '#4b5563',
    },  },
  typography: {
    fontFamily: {
      primary: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
      heading: "'Poppins', sans-serif",
      body: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
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