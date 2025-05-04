import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as FeeIcon,
  Timeline as StatisticsIcon,
  Group as UserManagementIcon
} from '@mui/icons-material';
import { isAdmin } from '../../utils/auth';

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard',
    adminOnly: false
  },
  { 
    text: 'Households', 
    icon: <PeopleIcon />, 
    path: '/households',
    adminOnly: false
  },
  { 
    text: 'Fees', 
    icon: <FeeIcon />, 
    path: '/fees',
    adminOnly: false
  },
  { 
    text: 'Payments', 
    icon: <ReceiptIcon />, 
    path: '/payments',
    adminOnly: false
  },
  { 
    text: 'Statistics', 
    icon: <StatisticsIcon />, 
    path: '/statistics',
    adminOnly: false
  },
  { 
    text: 'User Management', 
    icon: <UserManagementIcon />, 
    path: '/users',
    adminOnly: true
  }
];

const Sidebar = ({ open }) => {
  const location = useLocation();
  const admin = isAdmin();
  
  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || admin);

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: '2px 0 15px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: (theme) => theme.spacing(2),
          height: 64,
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: '1.5rem',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          BlueMoon Fees
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ padding: 1 }}>
        {visibleMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname.startsWith(item.path)}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname.startsWith(item.path)
                    ? 'primary.contrastText'
                    : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 