import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import Button from '../shared/Button';
import AlertMessage from '../shared/AlertMessage';
import LoadingSpinner from '../shared/LoadingSpinner';

export const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData.username, formData.password);
    
    if (result.success && onSuccess) {
      onSuccess(result.data);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <LoadingSpinner message="Fazendo login..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <AlertMessage type="error" message={error} />}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Usuário
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={!formData.username || !formData.password}
        className="w-full"
      >
        Entrar
      </Button>      {onSwitchToRegister && (
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1"
          >
            Não tem conta? Cadastre-se
          </button>
        </div>
      )}
    </form>
  );
};
