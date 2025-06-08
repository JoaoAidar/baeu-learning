import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import Button from '../shared/Button';
import AlertMessage from '../shared/AlertMessage';
import LoadingSpinner from '../shared/LoadingSpinner';

export const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const { register, loading, error } = useAuth();

  const validateForm = () => {
    const errors = {};
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem';
    }
    
    if (formData.password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Digite um email válido';
    }
    
    if (formData.username.length < 3) {
      errors.username = 'O nome de usuário deve ter pelo menos 3 caracteres';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await register(formData.username, formData.email, formData.password);
    
    if (result.success && onSuccess) {
      onSuccess(result.data);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpar erro de validação quando o usuário começar a digitar
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: undefined
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Criando conta..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <AlertMessage type="error" message={error} />}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Nome de Usuário
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            validationErrors.username ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {validationErrors.username && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            validationErrors.email ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            validationErrors.password ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirmar Senha
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {validationErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={!formData.username || !formData.email || !formData.password || !formData.confirmPassword}
        className="w-full"
      >
        Criar Conta
      </Button>      {onSwitchToLogin && (
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1"
          >
            Já tem conta? Faça login
          </button>
        </div>
      )}
    </form>
  );
};
