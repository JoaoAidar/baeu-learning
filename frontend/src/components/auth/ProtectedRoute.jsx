import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '../../contexts/auth';
import LoadingSpinner from '../shared/LoadingSpinner';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated } = useAuthState();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se requer privilégios de admin
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" state={{ error: 'Acesso negado' }} replace />;
  }

  return children;
};
