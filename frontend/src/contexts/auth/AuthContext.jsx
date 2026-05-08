import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authReducer } from './AuthReducer';
import { createAuthActions } from './AuthActions';
import { initialAuthState } from './AuthTypes';

// Criação do contexto
const AuthContext = createContext(null);

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const actions = createAuthActions(dispatch);

  // Verificar se existe usuário logado ao carregar a aplicação
  useEffect(() => {
    const initializeAuth = async () => {
      // Only try to get current user if we're not on login/signup pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
        const result = await actions.getCurrentUser();
        // Se não conseguir obter o usuário, não é necessário fazer nada
        // pois o estado já está inicializado como não autenticado
      }
    };

    initializeAuth();
  }, []); // Keep empty dependency array since actions is stable

  // Valor do contexto que será disponibilizado
  const contextValue = {
    // Estado
    ...state,
    
    // Ações
    ...actions,
    
    // Getters computados
    isLoading: state.loading,
    hasError: !!state.error,
    isLoggedIn: state.isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Hook para acessar apenas o estado (sem ações)
export const useAuthState = () => {
  const { user, loading, error, isAuthenticated, isLoading, hasError, isLoggedIn } = useAuth();
  
  return {
    user,
    loading,
    error,
    isAuthenticated,
    isLoading,
    hasError,
    isLoggedIn
  };
};

// Hook para acessar apenas as ações
export const useAuthActions = () => {
  const { 
    login, 
    register, 
    logout, 
    getCurrentUser, 
    updateProfile, 
    clearError, 
    setError 
  } = useAuth();
  
  return {
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    clearError,
    setError
  };
};

export default AuthContext;
