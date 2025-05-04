import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

const PageHeader = ({ 
  title, 
  subtitle,
  breadcrumbs = [],
  actionText, 
  actionIcon,
  onActionClick 
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast ? (
              <Typography key={index} color="text.primary">
                {crumb.label}
              </Typography>
            ) : (
              <Link 
                key={index} 
                component={RouterLink} 
                to={crumb.path} 
                underline="hover" 
                color="text.secondary"
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          mb: subtitle ? 1 : 0
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            mb: { xs: actionText ? 2 : 0, sm: 0 }
          }}
        >
          {title}
        </Typography>
        
        {actionText && onActionClick && (
          <Button
            variant="contained"
            startIcon={actionIcon}
            onClick={onActionClick}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1
            }}
          >
            {actionText}
          </Button>
        )}
      </Box>
      
      {subtitle && (
        <Typography 
          variant="body1" 
          color="text.secondary"
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader; 