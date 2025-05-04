import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  Alert,
  Divider,
  Link
} from '@mui/material';
import { login, register } from '../../services/authService';

const Login = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    password: false,
    confirmPassword: false,
    email: false,
    fullName: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.username) {
      errors.username = true;
      isValid = false;
    }

    if (!formData.password) {
      errors.password = true;
      isValid = false;
    }

    if (isRegistering) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = true;
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = true;
        isValid = false;
      }

      if (!formData.email) {
        errors.email = true;
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = true;
        isValid = false;
      }

      if (!formData.fullName) {
        errors.fullName = true;
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        await register({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName
        });
        setIsRegistering(false);
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
          fullName: ''
        });
      } else {
        await login(formData.username, formData.password);
        onLoginSuccess();
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        (isRegistering ? 'Registration failed. Please try again.' : 'Login failed. Please check your credentials.');
      
      setError(errorMessage);
      
      // Highlight the fields with error
      setFieldErrors({
        username: true,
        password: true,
        confirmPassword: isRegistering,
        email: isRegistering,
        fullName: isRegistering
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        padding: 2
      }}
    >
      <Card 
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          overflow: 'visible'
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: -5
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
            }}
          >
            <Typography
              variant="h4"
              color="white"
              sx={{
                fontWeight: 700,
              }}
            >
              BM
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 4, py: 3 }}>
          <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 600 }}>
            BlueMoon Fees
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ mb: 3 }}
          >
            {isRegistering ? 'Create a new account' : 'Enter your credentials to access the dashboard'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField 
              label="Username"
              name="username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              error={fieldErrors.username}
              helperText={fieldErrors.username ? "Username is required" : ""}
            />
            
            {isRegistering && (
              <TextField 
                label="Full Name"
                name="fullName"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={loading}
                error={fieldErrors.fullName}
                helperText={fieldErrors.fullName ? "Full name is required" : ""}
              />
            )}
            
            {isRegistering && (
              <TextField 
                label="Email"
                name="email"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                error={fieldErrors.email}
                helperText={fieldErrors.email ? "Valid email is required" : ""}
              />
            )}

            <TextField 
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              error={fieldErrors.password}
              helperText={fieldErrors.password ? "Password is required" : ""}
            />

            {isRegistering && (
              <TextField 
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                error={fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword ? "Passwords do not match" : ""}
              />
            )}

            <Button 
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 3, mb: 2, py: 1.2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isRegistering ? 'Register' : 'Log In'
              )}
            </Button>
          </form>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => setIsRegistering(!isRegistering)}
              sx={{ textDecoration: 'none' }}
            >
              {isRegistering 
                ? 'Already have an account? Log in' 
                : "Don't have an account? Register"}
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login; 