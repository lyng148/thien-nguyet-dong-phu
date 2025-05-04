// API configuration
export const API_BASE_URL = 'http://localhost:8080/api';

// Auth constants
export const TOKEN_KEY = 'bluemoon_token';
export const USER_KEY = 'bluemoon_user';
export const ROLE_ADMIN = 'ADMIN';
export const ROLE_USER = 'USER';

// Fee types
export const FEE_TYPES = {
  MAINTENANCE: 'Maintenance',
  UTILITY: 'Utility',
  SPECIAL: 'Special',
  MANDATORY: 'Mandatory',
  OPTIONAL: 'Optional'
};

// Payment statuses
export const PAYMENT_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  HOUSEHOLDS: '/households',
  HOUSEHOLD_FORM: '/households/form',
  HOUSEHOLD_EDIT: '/households/edit/:id',
  FEES: '/fees',
  FEE_FORM: '/fees/form',
  FEE_EDIT: '/fees/edit/:id',
  PAYMENTS: '/payments',
  PAYMENT_FORM: '/payments/form',
  PAYMENT_EDIT: '/payments/edit/:id',
  STATISTICS: '/statistics',
  PROFILE: '/profile',
  SETTINGS: '/settings'
};

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGINATION_OPTIONS = [5, 10, 25, 50];

// Theme settings
export const THEME = {
  PRIMARY_COLOR: '#1976d2',
  SECONDARY_COLOR: '#f50057',
  SUCCESS_COLOR: '#4caf50',
  WARNING_COLOR: '#ff9800',
  ERROR_COLOR: '#f44336'
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME_MODE: 'bluemoon_theme_mode',
  AUTH_TOKEN: 'bluemoon_auth_token',
  USER_PREFS: 'bluemoon_user_prefs'
};

// Default time ranges for reports/statistics
export const TIME_RANGES = {
  LAST_30_DAYS: '30days',
  LAST_90_DAYS: '90days', 
  LAST_6_MONTHS: '6months',
  LAST_12_MONTHS: '12months',
  CUSTOM: 'custom'
}; 