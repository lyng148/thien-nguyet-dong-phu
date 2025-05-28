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
  Group as UserManagementIcon,
  Home as HomeIcon,
  AssignmentInd as TemporaryResidenceIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { isAdmin, isToTruong, isKeToan } from '../../utils/auth';

const menuItems = [
  { 
    text: 'Bảng điều khiển', 
    icon: <DashboardIcon />, 
    path: '/dashboard',
    adminOnly: false,
    hideForToTruong: true,
    hideForKeToan: true
  },
  { 
    text: 'Bảng điều khiển TT', 
    icon: <DashboardIcon />, 
    path: '/totruong-dashboard',
    adminOnly: false,
    hideForToTruong: false,
    hideForKeToan: true,
    showOnlyForToTruong: true
  },
  { 
    text: 'Bảng điều khiển KT', 
    icon: <DashboardIcon />, 
    path: '/accountant-dashboard',
    adminOnly: false,
    hideForToTruong: true,
    hideForKeToan: false,
    showOnlyForKeToan: true
  },
  { 
    text: 'Hộ khẩu', 
    icon: <PeopleIcon />, 
    path: '/households',
    adminOnly: false,
    hideForToTruong: false,
    hideForKeToan: true
  },
  { 
    text: 'Khoản thu', 
    icon: <FeeIcon />, 
    path: '/fees',
    adminOnly: false,
    hideForToTruong: true,
    hideForKeToan: false
  },
  { 
    text: 'Nộp phí', 
    icon: <ReceiptIcon />, 
    path: '/payments',
    adminOnly: false,
    hideForToTruong: true,
    hideForKeToan: false
  },
  {
    text: 'Tạm trú/Tạm vắng',
    icon: <TemporaryResidenceIcon />,
    path: '/temporary-residence',
    adminOnly: false,
    hideForToTruong: false,
    hideForKeToan: true
  },
  {
    text: 'Nhân khẩu',
    icon: <PersonIcon />,
    path: '/persons',
    adminOnly: false,
    hideForToTruong: false,
    hideForKeToan: true
  },
  { 
    text: 'Thống kê', 
    icon: <StatisticsIcon />, 
    path: '/statistics',
    adminOnly: false,
    hideForToTruong: true,
    hideForKeToan: false
  },
  { 
    text: 'Quản lý User', 
    icon: <UserManagementIcon />, 
    path: '/users',
    adminOnly: true,
    hideForToTruong: false,
    hideForKeToan: true
  }
];

const Sidebar = ({ open }) => {
  const location = useLocation();
  const admin = isAdmin();
  const toTruong = isToTruong();
  const keToan = isKeToan();
  
  const visibleMenuItems = menuItems.filter(item => 
    (!item.adminOnly || admin) &&
    !(toTruong && item.hideForToTruong) &&
    !(keToan && item.hideForKeToan) &&
    (!item.showOnlyForKeToan || keToan) &&
    (!item.showOnlyForToTruong || toTruong)
  );

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