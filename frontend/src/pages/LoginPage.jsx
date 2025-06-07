import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { api } from '../utils/api'; // Assuming this is your API utility
import designSystem from '../styles/designSystem';

const { colors, spacing, typography, borderRadius, breakpoints, shadows } = designSystem;

// --- Styled Components ---

const LoginContainer = styled.div`
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
    padding: ${spacing.xl};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 200px); /* Adjust based on your Layout's header/footer height */

    @media (max-width: ${breakpoints.lg}) {
        padding: ${spacing.lg};
    }
    @media (max-width: ${breakpoints.md}) {
        padding: ${spacing.md};
    }
    @media (max-width: ${breakpoints.sm}) {
        padding: ${spacing.sm};
    }
`;

const LoginFormWrapper = styled.div`
    width: 100%;
    max-width: 400px;
    background-color: ${colors.background.paper};
    padding: ${spacing.xl};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.lg};

    @media (max-width: ${breakpoints.md}) {
        padding: ${spacing.lg};
    }
`;

const Title = styled.h1`
    color: ${colors.text.primary};
    font-size: ${typography.fontSize.xxl};
    margin-bottom: ${spacing.xl};
    text-align: center;

    @media (max-width: ${breakpoints.md}) {
        font-size: ${typography.fontSize.xl};
        margin-bottom: ${spacing.lg};
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const InputField = styled.input`
    padding: ${spacing.md};
    border: 2px solid ${colors.neutral.light};
    border-radius: ${borderRadius.md};
    font-size: ${typography.fontSize.md};
    width: 100%;

    &:focus {
        outline: none;
        border-color: ${colors.primary.main};
    }
`;

const StyledErrorMessage = styled.div`
    color: ${colors.error.main};
    margin-top: ${spacing.sm};
    text-align: center;
    font-size: ${typography.fontSize.sm};
`;

const TestCredentials = styled.p`
    margin-top: ${spacing.md};
    text-align: center;
    color: ${colors.text.secondary};
    font-size: ${typography.fontSize.sm};
`;

// --- LoginPage Component ---

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.post('/auth/login', formData);

            // Save token and user data to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to home page
            navigate('/');
        } catch (err) {
            // Provide a more user-friendly error message
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    }, [formData, navigate]);

    return (
        <Layout showHeader={false} showFooter={false}>
            <LoginContainer>
                <LoginFormWrapper>
                    <Title>Login</Title>
                    <Form onSubmit={handleSubmit}>
                        <InputField
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            aria-label="Username"
                        />
                        <InputField
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            aria-label="Password"
                        />
                        {error && <StyledErrorMessage role="alert">{error}</StyledErrorMessage>}
                        <Button type="submit" disabled={loading} fullWidth>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Form>
                    <TestCredentials>
                        Test credentials: username: **test**, password: **test123**
                    </TestCredentials>
                </LoginFormWrapper>
            </LoginContainer>
        </Layout>
    );
};

export default LoginPage;