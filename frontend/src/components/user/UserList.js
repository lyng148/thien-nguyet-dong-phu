import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import userService from '../../services/userService';
import { format } from 'date-fns';
import { isAdmin } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'USER',
    enabled: true
  });

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setNewUser({
        username: user.username,
        email: user.email,
        password: '',
        fullName: user.fullName || '',
        role: user.role,
        enabled: user.enabled
      });
    } else {
      setSelectedUser(null);
      setNewUser({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'USER',
        enabled: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setNewUser({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'USER',
      enabled: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: name === 'enabled' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        // Update existing user
        await userService.updateUser(selectedUser.id, {
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
          enabled: newUser.enabled
        });
      } else {
        // Create new user
        await userService.createUser(newUser);
      }
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      setError('Failed to save user. Please try again.');
      console.error('Error saving user:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await userService.toggleUserStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status. Please try again.');
      console.error('Error updating user status:', err);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    try {
      const isAdmin = currentRole === 'ADMIN';
      await userService.updateUserRole(userId, !isAdmin);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role. Please try again.');
      console.error('Error updating user role:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullName || '-'}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.role === 'ADMIN'}
                    onChange={() => handleToggleRole(user.id, user.role)}
                    color="primary"
                  />
                  {user.role === 'ADMIN' ? 'Admin' : 'User'}
                </TableCell>
                <TableCell>
                  <Tooltip title={user.enabled ? 'Active' : 'Inactive'}>
                    <IconButton 
                      color={user.enabled ? 'success' : 'error'}
                      onClick={() => handleToggleStatus(user.id, user.enabled)}
                    >
                      {user.enabled ? <ActiveIcon /> : <InactiveIcon />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={2}>
            <TextField
              label="Username"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Full Name"
              name="fullName"
              value={newUser.fullName}
              onChange={handleInputChange}
              fullWidth
            />
            {!selectedUser && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleInputChange}
                fullWidth
                required
              />
            )}
            <Box display="flex" alignItems="center" gap={1}>
              <Switch
                checked={newUser.role === 'ADMIN'}
                onChange={(e) => setNewUser(prev => ({
                  ...prev,
                  role: e.target.checked ? 'ADMIN' : 'USER'
                }))}
                color="primary"
              />
              <Typography>Admin Role</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Switch
                checked={newUser.enabled}
                onChange={handleInputChange}
                name="enabled"
                color="primary"
              />
              <Typography>Active</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList; 