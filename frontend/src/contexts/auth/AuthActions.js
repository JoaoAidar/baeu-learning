import { api } from '../../utils/api';
import { AUTH_ACTIONS } from './AuthTypes';

// Ações assíncronas para autenticação
export const createAuthActions = (dispatch) => {
  const setLoading = (loading) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error });
  };

  const setUser = (user) => {
    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await api.post('/auth/signup', { username, email, password });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      await api.post('/auth/logout');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      setLoading(true);
      clearError();
      
      const response = await api.get('/auth/me');
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'No user data received' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

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
