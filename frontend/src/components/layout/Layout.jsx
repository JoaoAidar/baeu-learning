import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { Container } from '../../styles/designSystem';
import { useTheme } from '../../contexts/ThemeContext';

const LayoutContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.background.default};
    width: 100%;
`;

const Header = styled.header`
    background-color: ${({ theme }) => theme.colors.background.paper};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    padding: ${({ theme }) => theme.spacing.md} 0;
    width: 100%;
    box-sizing: border-box;
`;

const Nav = styled.nav`
    width: 100%;
    background: transparent;
`;

const NavContent = styled(Container)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0;
    padding-bottom: 0;
`;

const Logo = styled(Link)`
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.normal} ${({ theme }) => theme.transitions.easeInOut};

    &:hover {
        color: ${({ theme }) => theme.colors.primary.dark};
    }
`;

const NavLinks = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.lg};
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        gap: ${({ theme }) => theme.spacing.md};
    }
`;

const NavLink = styled(Link)`
    color: ${({ theme }) => theme.colors.neutral.dark};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    transition: all ${({ theme }) => theme.transitions.normal} ${({ theme }) => theme.transitions.easeInOut};

    &:hover {
        color: ${({ theme }) => theme.colors.primary.main};
        background-color: ${({ theme }) => theme.colors.primary.light};
    }
    &.active {
        color: ${({ theme }) => theme.colors.primary.main};
        background-color: ${({ theme }) => theme.colors.primary.light};
    }
`;

const Main = styled.main`
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    padding: ${({ theme }) => theme.spacing.xl} 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        padding: ${({ theme }) => theme.spacing.lg} 0;
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        padding: ${({ theme }) => theme.spacing.md} 0;
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
        padding: ${({ theme }) => theme.spacing.sm} 0;
    }
`;

const Footer = styled.footer`
    background-color: ${({ theme }) => theme.colors.background.paper};
    padding: ${({ theme }) => theme.spacing.lg} 0;
    margin-top: auto;
    width: 100%;
    box-sizing: border-box;
`;

const FooterContent = styled(Container)`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.xl};
    justify-items: center;
    align-items: start;
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        gap: ${({ theme }) => theme.spacing.lg};
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        grid-template-columns: 1fr;
        gap: ${({ theme }) => theme.spacing.md};
    }
`;

const FooterSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
`;

const FooterTitle = styled.h3`
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.neutral.dark};
    margin: 0;
`;

const FooterLink = styled(Link)`
    color: ${({ theme }) => theme.colors.neutral.medium};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.normal} ${({ theme }) => theme.transitions.easeInOut};
    &:hover {
        color: ${({ theme }) => theme.colors.primary.main};
    }
`;

const Copyright = styled(Container)`
    text-align: center;
    padding-top: ${({ theme }) => theme.spacing.xl};
    color: ${({ theme }) => theme.colors.neutral.medium};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    padding-bottom: ${({ theme }) => theme.spacing.xl};
    @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
        padding-top: ${({ theme }) => theme.spacing.lg};
        padding-bottom: ${({ theme }) => theme.spacing.lg};
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
        padding-top: ${({ theme }) => theme.spacing.md};
        padding-bottom: ${({ theme }) => theme.spacing.md};
    }
`;

const Layout = ({ children, maxWidth, showHeader = true, showFooter = true }) => {
    const location = useLocation();
    const { mode, toggleTheme } = useTheme();

    return (
        <LayoutContainer>
            {showHeader && <Header>
                <Nav>
                    <NavContent>
                        <Logo to="/">BeaU Learning</Logo>
                        <NavLinks>
                            <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>
                                Home
                            </NavLink>
                            <NavLink to="/lessons" className={location.pathname.startsWith('/lessons') ? 'active' : ''}>
                                Lessons
                            </NavLink>
                            <NavLink to="/progress" className={location.pathname === '/progress' ? 'active' : ''}>
                                Progress
                            </NavLink>
                            <NavLink to="/about-me" className={location.pathname === '/about-me' ? 'active' : ''}>
                                About Me
                            </NavLink>
                            <NavLink to="/about-project" className={location.pathname === '/about-project' ? 'active' : ''}>
                                About Project
                            </NavLink>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    marginLeft: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: 'inherit',
                                }}
                                aria-label="Toggle dark mode"
                                title="Toggle dark mode"
                            >
                                {mode === 'dark' ? '🌙' : '☀️'}
                            </button>
                        </NavLinks>
                    </NavContent>
                </Nav>
            </Header>}
            <Main>
                <Container>
                    {children}
                </Container>
            </Main>
            {showFooter && <Footer>
                <FooterContent>
                    <FooterSection>
                        <FooterTitle>Learn Korean</FooterTitle>
                        <FooterLink to="/lessons">Start Learning</FooterLink>
                        <FooterLink to="/progress">Track Progress</FooterLink>
                        <FooterLink to="/about">About Us</FooterLink>
                    </FooterSection>
                    <FooterSection>
                        <FooterTitle>Resources</FooterTitle>
                        <FooterLink to="/grammar">Grammar Guide</FooterLink>
                        <FooterLink to="/vocabulary">Vocabulary</FooterLink>
                        <FooterLink to="/practice">Practice Exercises</FooterLink>
                    </FooterSection>
                    <FooterSection>
                        <FooterTitle>Support</FooterTitle>
                        <FooterLink to="/faq">FAQ</FooterLink>
                        <FooterLink to="/contact">Contact Us</FooterLink>
                        <FooterLink to="/privacy">Privacy Policy</FooterLink>
                    </FooterSection>
                </FooterContent>
                <Copyright>
                    © {new Date().getFullYear()} BeaU Learning. All rights reserved.
                </Copyright>
            </Footer>}
        </LayoutContainer>
    );
};

export default Layout; 