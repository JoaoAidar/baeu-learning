import React from 'react';
import { useAuth } from '../../contexts/auth';
import Button from '../shared/Button';
import AlertMessage from '../shared/AlertMessage';

export const LogoutButton = ({ className = '', children = 'Sair', showConfirmation = true }) => {
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    if (showConfirmation && !window.confirm('Tem certeza que deseja sair?')) {
      return;
    }

    try {
      await logout();
      // O redirecionamento será tratado pelo contexto ou pela aplicação
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      loading={loading}
      variant="outline"
      className={className}
    >
      {children}
    </Button>
  );
};
