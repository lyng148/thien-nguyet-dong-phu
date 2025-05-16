import { TOKEN_KEY, USER_KEY, ROLE_ADMIN, ROLE_TO_TRUONG, ROLE_KE_TOAN } from '../config/constants';

// Token management
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};

// For backward compatibility
export const clearToken = () => {
  clearAuth();
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// User data management
export const setUserData = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Role check functions
export const isAdmin = () => {
  try {
    // Check from user data first
    const userData = getUserData();
    if (userData && userData.role) {
      return userData.role === 'ROLE_ADMIN' || userData.role === 'ADMIN';
    }

    // Fallback to token check
    const token = getToken();
    if (!token) return false;
    
    try {
      // Decode the JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      
      // Check for both ROLE_ADMIN and ADMIN in roles array
      if (Array.isArray(payload.roles)) {
        return payload.roles.some(role => role === 'ROLE_ADMIN' || role === 'ADMIN');
      }
      
      // Check if role is a single string
      if (typeof payload.role === 'string') {
        return payload.role === 'ROLE_ADMIN' || payload.role === 'ADMIN';
      }
      
      return false;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return false;
    }
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
};

// Check if user is TO_TRUONG (Head/Deputy)
export const isToTruong = () => {
  try {
    const userData = getUserData();
    if (userData && userData.role) {
      return userData.role === 'ROLE_TO_TRUONG' || userData.role === 'TO_TRUONG';
    }
    
    // Fallback to token check
    const token = getToken();
    if (!token) return false;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      
      if (Array.isArray(payload.roles)) {
        return payload.roles.some(role => role === 'ROLE_TO_TRUONG' || role === 'TO_TRUONG');
      }
      
      if (typeof payload.role === 'string') {
        return payload.role === 'ROLE_TO_TRUONG' || payload.role === 'TO_TRUONG';
      }
      
      return false;
    } catch (error) {
      return false;
    }
  } catch (err) {
    return false;
  }
};

// Check if user is KE_TOAN (Accountant)
export const isKeToan = () => {
  try {
    const userData = getUserData();
    if (userData && userData.role) {
      return userData.role === 'ROLE_KE_TOAN' || userData.role === 'KE_TOAN';
    }
    
    // Fallback to token check
    const token = getToken();
    if (!token) return false;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      
      if (Array.isArray(payload.roles)) {
        return payload.roles.some(role => role === 'ROLE_KE_TOAN' || role === 'KE_TOAN');
      }
      
      if (typeof payload.role === 'string') {
        return payload.role === 'ROLE_KE_TOAN' || payload.role === 'KE_TOAN';
      }
      
      return false;
    } catch (error) {
      return false;
    }
  } catch (err) {
    return false;
  }
};

// Check if user can access household management features (ADMIN or TO_TRUONG)
export const canAccessHouseholdManagement = () => {
  return isAdmin() || isToTruong();
};

// Check if user can access fee/payment features (ADMIN or KE_TOAN)
export const canAccessFeeManagement = () => {
  return isAdmin() || isKeToan();
};

// Get user info from token
export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Add token to axios request
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};