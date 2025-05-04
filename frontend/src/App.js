import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';

// Components
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import HouseholdList from './components/household/HouseholdList';
import HouseholdForm from './components/household/HouseholdForm';
import FeeList from './components/fee/FeeList';
import FeeForm from './components/fee/FeeForm';
import PaymentList from './components/payment/PaymentList';
import PaymentForm from './components/payment/PaymentForm';
import Statistics from './components/statistics/Statistics';
import UserList from './components/user/UserList';

// Services & Utilities
import { getToken, clearToken, isAdmin } from './utils/auth';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

const App = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if we're on the login page
  const isLoginPage = location.pathname === '/login';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        {isAuthenticated && !isLoginPage && (
          <Sidebar open={isSidebarOpen}>
            <List>
              {isAdmin() && (
                <ListItem button component={Link} to="/users">
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="User Management" />
                </ListItem>
              )}
            </List>
          </Sidebar>
        )}
        <div className={`content ${isAuthenticated && isSidebarOpen ? '' : 'content-full'}`}>
          {isAuthenticated && !isLoginPage && (
            <Navbar 
              toggleSidebar={toggleSidebar} 
              isSidebarOpen={isSidebarOpen}
              onLogout={handleLogout}
            />
          )}
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLoginSuccess={() => setIsAuthenticated(true)} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <Dashboard /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/households" 
              element={
                isAuthenticated ? 
                <HouseholdList /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/households/add" 
              element={
                isAuthenticated ? 
                <HouseholdForm /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/households/edit/:id" 
              element={
                isAuthenticated ? 
                <HouseholdForm /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/fees" 
              element={
                isAuthenticated ? 
                <FeeList /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/fees/add" 
              element={
                isAuthenticated ? 
                <FeeForm /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/fees/edit/:id" 
              element={
                isAuthenticated ? 
                <FeeForm /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/payments" 
              element={
                isAuthenticated ? 
                <PaymentList /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/payments/add" 
              element={
                isAuthenticated ? 
                <PaymentForm /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/payments/form" 
              element={
                isAuthenticated ? 
                <PaymentForm /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/payments/edit/:id" 
              element={
                isAuthenticated ? 
                <PaymentForm /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/statistics" 
              element={
                isAuthenticated ? 
                <Statistics /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/users" 
              element={
                isAuthenticated ? 
                <UserList /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App; 