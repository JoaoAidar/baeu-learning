// Tipos de ação para o contexto de autenticação
export const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT'
};

// Estado inicial do contexto de autenticação
export const initialAuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};
