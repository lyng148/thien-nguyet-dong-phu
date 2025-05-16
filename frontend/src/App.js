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
import FeeDetail from './components/fee/FeeDetail';
import PaymentList from './components/payment/PaymentList';
import PaymentForm from './components/payment/PaymentForm';
import Statistics from './components/statistics/Statistics';
import UserList from './components/user/UserList';
import HouseholdDetail from './components/household/HouseholdDetail';
import PersonForm from './components/person/PersonForm';
import TemporaryResidenceForm from './components/temporaryResidence/TemporaryResidenceForm';

// Thêm import cho các component mới
const TemporaryResidence = React.lazy(() => import('./components/temporaryResidence/TemporaryResidence'));
const PersonList = React.lazy(() => import('./components/person/PersonList'));

// Services & Utilities
import { getToken, clearToken, isAdmin, canAccessHouseholdManagement, canAccessFeeManagement, isToTruong, isKeToan } from './utils/auth';

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
                isAuthenticated ? (
                  isToTruong() ? 
                  <Navigate to="/households" replace /> : 
                  isKeToan() ?
                  <Navigate to="/fees" replace /> :
                  <Dashboard />
                ) : <Navigate to="/login" replace />
              } 
            />
            {/* Household Management - ACCESS: ADMIN or TO_TRUONG */}
            <Route 
              path="/households" 
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? 
                  <HouseholdList /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/households/add" 
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? 
                  <HouseholdForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/households/edit/:id" 
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? 
                  <HouseholdForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/households/:id" 
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? 
                  <HouseholdDetail /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            
            {/* Fee Management - ACCESS: ADMIN or KE_TOAN */}
            <Route 
              path="/fees" 
              element={
                isAuthenticated ? (
                  canAccessFeeManagement() ? 
                  <FeeList /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/fees/add" 
              element={
                isAuthenticated ? (
                  canAccessFeeManagement() ? 
                  <FeeForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/fees/edit/:id" 
              element={
                isAuthenticated ? (
                  canAccessFeeManagement() ? 
                  <FeeForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/fees/detail/:id" 
              element={
                isAuthenticated ? (
                  canAccessFeeManagement() ? 
                  <FeeDetail /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            
            {/* Payment Management - ACCESS: ADMIN or KE_TOAN */}
            <Route 
              path="/payments" 
              element={
                isAuthenticated ? (
                  canAccessFeeManagement() ? 
                  <PaymentList /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/payments/add" 
              element={
                isAuthenticated ? (
                  canAccessFeeManagement() ? 
                  <PaymentForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/payments/form" 
              element={
                isAuthenticated ? (
                  canAccessFeeManagement() ? 
                  <PaymentForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/payments/edit/:id" 
              element={
                isAuthenticated ? (
                  canAccessFeeManagement() ? 
                  <PaymentForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            
            {/* Statistics - ACCESS: ADMIN or KE_TOAN */}
            <Route 
              path="/statistics" 
              element={
                isAuthenticated ? (
                  canAccessFeeManagement() ? 
                  <Statistics /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            
            {/* User Management - ACCESS: ADMIN only */}
            <Route 
              path="/users" 
              element={
                isAuthenticated ? (
                  isAdmin() ? 
                  <UserList /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              } 
            />
            
            {/* Temporary Residence Management - ACCESS: ADMIN or TO_TRUONG */}
            <Route
              path="/temporary-residence"
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? (
                    <React.Suspense fallback={<div>Đang tải...</div>}>
                      <TemporaryResidence />
                    </React.Suspense>
                  ) : <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              }
            />
            
            {/* Person Management - ACCESS: ADMIN or TO_TRUONG */}
            <Route
              path="/persons"
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? (
                    <React.Suspense fallback={<div>Đang tải...</div>}>
                      <PersonList />
                    </React.Suspense>
                  ) : <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/persons/add"
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? 
                  <PersonForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/persons/edit/:id"
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? 
                  <PersonForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/persons/:id"
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? 
                  <PersonForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/temporary-residence/add"
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? 
                  <TemporaryResidenceForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/temporary-residence/edit/:id"
              element={
                isAuthenticated ? (
                  canAccessHouseholdManagement() ? 
                  <TemporaryResidenceForm /> : 
                  <Navigate to="/dashboard" replace />
                ) : <Navigate to="/login" replace />
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