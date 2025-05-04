import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  CircularProgress,
  ListItemText,
  styled
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { format } from 'date-fns';
import notificationService from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

// Styled components
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: '400px',
    maxHeight: '80vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    boxShadow: theme.shadows[3]
  }
}));

const NotificationItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  whiteSpace: 'normal',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const NotificationTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: '0.95rem',
  marginBottom: '4px'
});

const NotificationTime = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.8rem'
}));

const NotificationContent = styled(Typography)({
  fontSize: '0.9rem',
  lineHeight: 1.5
});

const NotificationMenu = () => {
  console.log('NotificationMenu rendered'); // Debug log
  
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    console.log('NotificationMenu useEffect running'); // Debug log
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    console.log('Starting to fetch notifications');
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getUnreadNotifications();
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      console.log('Finished fetching notifications');
    }
  };

  const handleClick = (event) => {
    console.log('Notification icon clicked', event.currentTarget);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    console.log('Closing notification menu');
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      await notificationService.markAsRead(notification.id);
      const updatedNotifications = notifications.filter(n => n.id !== notification.id);
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.length);
      handleClose();
      
      // Navigate based on entity type
      if (notification.entityId) {
        switch (notification.entityType) {
          case 'FEE':
            navigate(`/fees/${notification.entityId}`);
            break;
          case 'HOUSEHOLD':
            navigate(`/households/${notification.entityId}`);
            break;
          case 'PAYMENT':
            navigate(`/payments/${notification.entityId}`);
            break;
          default:
            // Nếu không có entityType phù hợp, chỉ chuyển hướng đến trang danh sách tương ứng
            navigateToListPage(notification.entityType);
            break;
        }
      } else {
        // Nếu không có entityId, chuyển hướng đến trang danh sách tương ứng
        navigateToListPage(notification.entityType);
      }
      
      fetchNotifications();
    } catch (error) {
      console.error('Error handling notification:', error);
      setError('Failed to mark notification as read');
      // Vẫn chuyển hướng đến trang danh sách nếu có lỗi
      navigateToListPage(notification.entityType);
    }
  };

  const navigateToListPage = (entityType) => {
    switch (entityType) {
      case 'FEE':
        navigate('/fees');
        break;
      case 'HOUSEHOLD':
        navigate('/households');
        break;
      case 'PAYMENT':
        navigate('/payments');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  console.log('Rendering NotificationMenu, open:', open, 'anchorEl:', anchorEl); // Debug log

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        size="large"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid divider' }}>
          <Typography variant="h6">
            Notifications
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error && (
          <MenuItem disabled>
            <ListItemText primary={error} sx={{ color: 'error.main' }} />
          </MenuItem>
        )}
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} onClick={() => handleNotificationClick(notification)}>
              <Box>
                <NotificationTitle>
                  {notification.title}
                </NotificationTitle>
                <NotificationContent>
                  {notification.message}
                </NotificationContent>
                <NotificationTime>
                  {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                </NotificationTime>
              </Box>
            </NotificationItem>
          ))
        )}
      </StyledMenu>
    </>
  );
};

export default NotificationMenu; 