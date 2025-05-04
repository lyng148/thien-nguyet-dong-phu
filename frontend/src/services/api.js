import axios from 'axios';
import { getToken } from '../utils/auth';

// Define the API URL directly
const API_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log('Token retrieved for API request:', token ? 'Token exists' : 'No token');
    
    if (token) {
      // Set the authorization header with the token
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Setting Authorization header for:', config.url);
    } else {
      console.warn('No authentication token available for request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API response from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('API request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Unauthorized access detected. Redirecting to login page.');
        // Remove tokens from storage
        localStorage.removeItem('bluemoon_token');
        localStorage.removeItem('bluemoon_user');
        
        // Redirect to login instead of reloading the page
        window.location.href = '/login';
      }
    }
    
    // Always reject the promise so the error can be handled by the component
    return Promise.reject(error);
  }
);

export default api; 