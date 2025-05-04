import api from './api';
import { setToken, setUserData } from '../utils/auth';
import { ROLE_ADMIN, ROLE_USER, TOKEN_KEY, USER_KEY } from '../config/constants';

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    
    if (response.data && response.data.token) {
      setToken(response.data.token);
      setUserData({
        username: response.data.username,
        role: response.data.role,
        displayName: response.data.fullName || response.data.username
      });
      return response.data;
    }
    
    throw new Error('Invalid login response');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response.data && response.data.token) {
      setToken(response.data.token);
      setUserData({
        username: response.data.username,
        role: response.data.role,
        displayName: response.data.fullName || response.data.username
      });
      return response.data;
    }
    
    throw new Error('Invalid registration response');
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', null, {
      params: { userId, oldPassword, newPassword }
    });
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

// Get the current user
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Logout the user
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
}; 