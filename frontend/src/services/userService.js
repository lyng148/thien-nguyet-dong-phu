import axios from 'axios';
import { API_BASE_URL } from '../config';
import { authHeader } from '../utils/auth';

const userService = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (userId, isAdmin) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}/role`, 
        { isAdmin },
        {
          headers: authHeader()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Toggle user status
  toggleUserStatus: async (userId, enabled) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}/status`, 
        { enabled },
        {
          headers: authHeader()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default userService; 