import styled from 'styled-components';

// Modern BaeU Learning color palette
export const colors = {
    // Primary colors - Red accent
    primary: {
        main: '#d62828', // Primary red accent
        light: '#f87171',
        dark: '#991b1b',
        contrast: '#ffffff'
    },
    // Secondary colors - Blue accent
    secondary: {
        main: '#023e8a', // Secondary blue accent
        light: '#60a5fa',
        dark: '#1e3a8a',
        contrast: '#ffffff'
    },
    // Accent colors - For highlights and success states
    accent: {
        main: '#48bb78', // Success green
        light: '#68d391',
        dark: '#38a169',
        contrast: '#ffffff'
    },
    // Neutral colors - For backgrounds and text
    neutral: {
        light: '#f1f3f4',
        main: '#e8eaed',
        dark: '#9aa0a6',
        white: '#ffffff'
    },
    // Semantic colors
    success: {
        main: '#48bb78',
        light: '#68d391',
        dark: '#38a169',
        contrast: '#ffffff'
    },
    error: {
        main: '#dc2626',
        light: '#fca5a5',
        dark: '#991b1b',
        contrast: '#ffffff'
    },
    warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        contrast: '#ffffff'
    },
    text: {
        primary: '#202124',
        secondary: '#5f6368',
        disabled: '#9aa0a6',
    },
    background: {
        default: '#f8f9fa', // Base background color
        paper: '#ffffff',
    },    // Dark mode palette
    dark: {
        primary: {
            main: '#f87171', // Lighter red for dark mode
            light: '#fca5a5',
            dark: '#dc2626',
            contrast: '#1f2937'
        },
        secondary: {
            main: '#60a5fa', // Lighter blue for dark mode
            light: '#93c5fd',
            dark: '#1d4ed8',
            contrast: '#1f2937'
        },
        accent: {
            main: '#68d391',
            light: '#9ae6b4',
            dark: '#48bb78',
            contrast: '#1f2937'
        },
        neutral: {
            light: '#374151',
            main: '#4b5563',
            dark: '#6b7280',
            white: '#1f2937'
        },
        success: {
            main: '#68d391',
            light: '#9ae6b4',
            dark: '#48bb78',
            contrast: '#1f2937'
        },
        error: {
            main: '#fca5a5',
            light: '#fecaca',
            dark: '#dc2626',
            contrast: '#1f2937'
        },
        warning: {
            main: '#fbbf24',
            light: '#fde047',
            dark: '#f59e0b',
        },
        text: {
            primary: '#f9fafb',
            secondary: '#d1d5db',
            disabled: '#9ca3af',
        },
        background: {
            default: '#111827',
            paper: '#1f2937',
        },
    }
};

// Typography configuration
export const typography = {
    fontFamily: {
        primary: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif", // Primary sans-serif
        secondary: "'Poppins', sans-serif", // Secondary for headings
        heading: "'Poppins', sans-serif",
        body: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem',// 30px
        '4xl': '2.25rem', // 36px
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
    }
};

// Spacing system
export const spacing = {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
};

// Border radius
export const borderRadius = {
    none: '0',
    sm: '0.125rem',
    default: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
};

// Shadows
export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Transitions
export const transitions = {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.45s ease',
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

// Export designSystem as default for convenience
export default designSystem;