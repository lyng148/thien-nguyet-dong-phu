import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle,
  ExitToApp
} from '@mui/icons-material';
import { getUserData, isAdmin } from '../../utils/auth';
import NotificationMenu from './NotificationMenu';

const Navbar = ({ toggleSidebar, isSidebarOpen, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const userData = getUserData();
  const admin = isAdmin();
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <IconButton
          color="primary"
          edge="start"
          onClick={toggleSidebar}
          sx={{ 
            mr: 2, 
            ...(isSidebarOpen && { 
              transform: 'rotate(180deg)',
              transition: 'transform 0.3s'
            })
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {admin && <NotificationMenu />}

          <Box sx={{ ml: 2 }}>
            <IconButton onClick={handleMenu} size="small" sx={{ ml: 2 }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'primary.main',
                  color: 'white'
                }}
              >
                {userData?.username ? userData.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {userData?.username || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userData?.role || 'Role'}
                </Typography>
              </Box>
              <MenuItem onClick={handleClose}>
                <AccountCircle sx={{ mr: 2 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 