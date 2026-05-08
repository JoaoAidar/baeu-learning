import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
// FIX: Change import to specifically get the named export 'registerUser'
import {registerUser} from '../lib/api'; // <--- CHANGED THIS LINE
import { Container } from '../styles/designSystem';

const RegisterContainer = styled(Container)`
    max-width: 400px;
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing.xl};
`;

const RegisterCard = styled.div`
    background-color: ${({ theme }) => theme.colors.background.paper};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.xl};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border: 1px solid ${({ theme }) => theme.colors.neutral.light};
`;

const Title = styled.h1`
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    color: ${({ theme }) => theme.colors.text.primary};
    text-align: center;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
    padding: ${({ theme }) => theme.spacing.md};
    border: 2px solid ${({ theme }) => theme.colors.neutral.light};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.default};
    transition: all ${({ theme }) => theme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary.main};
        box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light};
    }

    &::placeholder {
        color: ${({ theme }) => theme.colors.text.disabled};
    }
`;

const Button = styled.button`
    padding: ${({ theme }) => theme.spacing.md};
    background-color: #d62828;
    color: #ffffff;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.normal};
    margin-top: ${({ theme }) => theme.spacing.md};

    &:hover {
        background-color: #991b1b;
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.2);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const ErrorMessage = styled.div`
    color: ${({ theme }) => theme.colors.error.main};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    text-align: center;
    margin-top: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.sm};
    background-color: ${({ theme }) => theme.colors.error.light};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    animation: fadeIn 0.3s ease-in-out;

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const LoginLink = styled.div`
    text-align: center;
    margin-top: ${({ theme }) => theme.spacing.xl};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};

    a {
        color: ${({ theme }) => theme.colors.primary.main};
        text-decoration: none;
        font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
        transition: color ${({ theme }) => theme.transitions.fast};

        &:hover {
            color: ${({ theme }) => theme.colors.primary.dark};
            text-decoration: underline;
        }
    }
`;

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // Now directly call the imported registerUser function
            const response = await registerUser(formData.username, formData.email, formData.password);

            if (response.success) {
                navigate('/login');
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err) {
            console.error("Registration error:", err); // Log the full error for debugging
            // axios errors typically have a 'response' object with 'data'
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <RegisterContainer>
            <RegisterCard>
                <Title>Create Account</Title>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Choose a username"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </FormGroup>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </Form>
                <LoginLink>
                    Already have an account? <Link to="/login">Sign in</Link>
                </LoginLink>
            </RegisterCard>
        </RegisterContainer>
    );
};

export default Register;