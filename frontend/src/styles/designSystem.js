import styled from 'styled-components';

// Korean-inspired color palette
export const colors = {
    // Primary colors - Duolingo-inspired with dark blue
    primary: {
        main: '#1a365d', // Dark blue as primary
        light: '#2c5282',
        dark: '#0f2942',
        contrast: '#FFFFFF'
    },
    // Secondary colors - Complementary to dark blue
    secondary: {
        main: '#4299e1', // Bright blue as secondary
        light: '#63b3ed',
        dark: '#3182ce',
        contrast: '#FFFFFF'
    },
    // Accent colors - For highlights and success states
    accent: {
        main: '#48bb78', // Success green
        light: '#68d391',
        dark: '#38a169',
        contrast: '#FFFFFF'
    },
    // Neutral colors - For backgrounds and text
    neutral: {
        light: '#f7fafc',
        main: '#e2e8f0',
        dark: '#a0aec0',
        white: '#FFFFFF'
    },
    // Semantic colors
    success: {
        main: '#48bb78',
        light: '#68d391',
        dark: '#38a169',
        contrast: '#FFFFFF'
    },
    error: {
        main: '#f56565',
        light: '#fc8181',
        dark: '#e53e3e',
        contrast: '#FFFFFF'
    },
    warning: {
        main: '#ed8936',
        light: '#f6ad55',
        dark: '#dd6b20',
        contrast: '#FFFFFF'
    },
    text: {
        primary: '#2d3748',
        secondary: '#4a5568',
        disabled: '#a0aec0',
    },
    background: {
        default: '#ffffff',
        paper: '#f7fafc',
    },
    // Dark mode palette
    dark: {
        primary: {
            main: '#4299e1',
            light: '#63b3ed',
            dark: '#3182ce',
            contrast: '#1a202c'
        },
        secondary: {
            main: '#48bb78',
            light: '#68d391',
            dark: '#38a169',
            contrast: '#1a202c'
        },
        accent: {
            main: '#f6ad55',
            light: '#fbd38d',
            dark: '#ed8936',
            contrast: '#1a202c'
        },
        neutral: {
            light: '#1a202c',
            main: '#2d3748',
            dark: '#4a5568',
            white: '#1a202c'
        },
        success: {
            main: '#68d391',
            light: '#9ae6b4',
            dark: '#48bb78',
            contrast: '#1a202c'
        },
        error: {
            main: '#fc8181',
            light: '#feb2b2',
            dark: '#f56565',
            contrast: '#1a202c'
        },
        warning: {
            main: '#f6ad55',
            light: '#fbd38d',
            dark: '#ed8936',
        },
        text: {
            primary: '#f7fafc',
            secondary: '#e2e8f0',
            disabled: '#a0aec0',
        },
        background: {
            default: '#1a202c',
            paper: '#2d3748',
        },
    }
};

// Typography - Modern and friendly
export const typography = {
    fontFamily: {
        primary: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        secondary: "'Nunito Sans', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', 'Courier New', Courier, monospace",
    },
    fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        xxl: '1.5rem',    // 24px
        xxxl: '2rem',     // 32px
    },
    fontWeight: {
        light: 300,
        regular: 400,
        medium: 600,
        semibold: 700,
        bold: 800,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    }
};

// Spacing
export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
};

// Border radius - More rounded corners for a friendly feel
export const borderRadius = {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px'
};

// Shadows - Softer shadows for depth
export const shadows = {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Transitions - Smoother animations
export const transitions = {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Z-index
export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
};

// Breakpoints
export const breakpoints = {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
};

// Container max widths
export const containerMaxWidths = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
};

// Animation
export const animation = {
    // Korean-inspired animation timings
    fast: '200ms',
    normal: '400ms',
    slow: '800ms',
    // Easing functions
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
};

// Layout sizing
export const layout = {
    maxWidth: '1440px',
};

// Export all as a single object
export const designSystem = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    transitions,
    zIndex,
    breakpoints,
    containerMaxWidths,
    animation,
    layout
};

export const Container = styled.div`
    width: 100%;
    max-width: ${layout.maxWidth};
    margin-left: auto;
    margin-right: auto;
    padding-left: ${spacing.xl};
    padding-right: ${spacing.xl};
    box-sizing: border-box;
    @media (max-width: ${breakpoints.lg}) {
        padding-left: ${spacing.lg};
        padding-right: ${spacing.lg};
    }
    @media (max-width: ${breakpoints.md}) {
        padding-left: ${spacing.md};
        padding-right: ${spacing.md};
    }
    @media (max-width: ${breakpoints.sm}) {
        padding-left: ${spacing.sm};
        padding-right: ${spacing.sm};
    }
`;

designSystem.Container = Container;

// Theme objects for styled-components
export const lightTheme = {
    colors: {
        ...colors,
    },
    typography,
    spacing,
    borderRadius,
    shadows,
    transitions,
    zIndex,
    breakpoints,
    containerMaxWidths,
    animation,
    layout
};

export const darkTheme = {
    colors: {
        ...colors.dark,
    },
    typography,
    spacing,
    borderRadius,
    shadows,
    transitions,
    zIndex,
    breakpoints,
    containerMaxWidths,
    animation,
    layout
};

export default designSystem; 