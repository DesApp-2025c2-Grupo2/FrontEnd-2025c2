import React from 'react';
import { Box, Typography } from '@mui/material';
import TarjetaAccionRapida from './TarjetaAccionRapida';

const SeccionAccionesRapidas = ({ actions = [] }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold', 
          color: '#333',
          mb: 2
        }}
      >
        Acciones Rápidas
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(auto-fit, minmax(280px, 1fr))', 
          md: 'repeat(3, minmax(300px, 1fr))' 
        }, 
        gap: 2,
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'stretch'
      }}>
        {actions.map((action, index) => (
          <TarjetaAccionRapida
            key={index}
            title={action.title}
            subtitle={action.subtitle}
            icon={action.icon}
            backgroundColor={action.backgroundColor}
            onClick={action.onClick}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SeccionAccionesRapidas;
