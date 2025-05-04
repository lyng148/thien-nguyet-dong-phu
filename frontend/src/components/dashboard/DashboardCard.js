import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor,
  subtitle,
  onClick
}) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4"
              sx={{ 
                fontWeight: 600,
                mb: subtitle ? 0.5 : 0
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
              borderRadius: '50%',
              backgroundColor: iconBgColor || 'background.default',
              color: iconColor || 'primary.main',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard; 