import React from 'react';
import { Card, CardContent, Box, Typography, IconButton } from '@mui/material';

const TarjetaAccionRapida = ({ 
  title, 
  subtitle, 
  icon, 
  backgroundColor, 
  onClick 
}) => {
  return (
    <Card 
      sx={{ 
        backgroundColor,
        color: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6
        },
        height: '100%',
        width: '100%',
        minHeight: 120,
        display: 'flex',
        alignItems: 'center'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%', p: 2 }}>
        <IconButton 
          sx={{ 
            color: 'white', 
            mr: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          {icon}
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {subtitle}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TarjetaAccionRapida;
