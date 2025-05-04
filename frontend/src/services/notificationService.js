import axios from 'axios';
import { API_BASE_URL } from '../config';
import { authHeader } from '../utils/auth';

const notificationService = {
  // Get all unread notifications
  getUnreadNotifications: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get notifications for a specific user
  getUserNotifications: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/user/${userId}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },

  // Get count of unread notifications
  getUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/unread/count`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, null, {
        headers: authHeader()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};

export default notificationService; 