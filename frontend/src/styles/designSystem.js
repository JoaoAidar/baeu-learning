import styled from 'styled-components';

// Korean-inspired color palette
export const colors = {
    // Primary colors inspired by Korean traditional colors
    primary: {
        main: '#2563eb',
        light: '#60a5fa',
        dark: '#1d4ed8',
        contrast: '#FFFFFF'
    },
    // Secondary colors
    secondary: {
        main: '#7c3aed',
        light: '#a78bfa',
        dark: '#5b21b6',
        contrast: '#FFFFFF'
    },
    // Accent colors
    accent: {
        main: '#FF8E8E', // Soft Korean red
        light: '#FFE5E5',
        dark: '#CC7272',
        contrast: '#FFFFFF'
    },
    // Neutral colors
    neutral: {
        light: '#f3f4f6',
        main: '#9ca3af',
        dark: '#4b5563',
        white: '#FFFFFF'
    },
    // Semantic colors
    success: {
        main: '#059669',
        light: '#34d399',
        dark: '#047857',
        contrast: '#FFFFFF'
    },
    error: {
        main: '#dc2626',
        light: '#f87171',
        dark: '#b91c1c',
        contrast: '#FFFFFF'
    },
    warning: {
        main: '#d97706',
        light: '#fbbf24',
        dark: '#b45309',
    },
    text: {
        primary: '#111827',
        secondary: '#4b5563',
        disabled: '#9ca3af',
    },
    background: {
        default: '#ffffff',
        paper: '#f9fafb',
    },
    // Dark mode palette
    dark: {
        primary: {
            main: '#60a5fa',
            light: '#93c5fd',
            dark: '#2563eb',
            contrast: '#18181b'
        },
        secondary: {
            main: '#a78bfa',
            light: '#c4b5fd',
            dark: '#7c3aed',
            contrast: '#18181b'
        },
        accent: {
            main: '#FFB4B4',
            light: '#FFE5E5',
            dark: '#CC7272',
            contrast: '#18181b'
        },
        neutral: {
            light: '#18181b',
            main: '#27272a',
            dark: '#3f3f46',
            white: '#18181b'
        },
        success: {
            main: '#34d399',
            light: '#6ee7b7',
            dark: '#059669',
            contrast: '#18181b'
        },
        error: {
            main: '#f87171',
            light: '#fecaca',
            dark: '#dc2626',
            contrast: '#18181b'
        },
        warning: {
            main: '#fbbf24',
            light: '#fde68a',
            dark: '#d97706',
        },
        text: {
            primary: '#f3f4f6',
            secondary: '#d1d5db',
            disabled: '#6b7280',
        },
        background: {
            default: '#18181b',
            paper: '#27272a',
        },
    }
};

// Typography
export const typography = {
    fontFamily: {
        primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        secondary: "'Noto Serif KR', serif",
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
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: {
        tight: 1.25,
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

// Border radius
export const borderRadius = {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.25rem',    // 4px
    lg: '0.5rem',     // 8px
    xl: '1rem',       // 16px
    full: '9999px'
};

// Shadows
export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Transitions
export const transitions = {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
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