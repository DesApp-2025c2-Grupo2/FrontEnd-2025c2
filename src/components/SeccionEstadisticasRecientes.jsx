import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import TarjetaEstadistica from './TarjetaEstadistica';

const SeccionEstadisticasRecientes = ({ stats = [] }) => {
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
        Estadísticas Recientes
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
        {stats.map((stat, index) => (
          <TarjetaEstadistica
            key={index}
            title={stat.title}
            count={stat.count}
            icon={stat.icon}
            subtitle={stat.subtitle}
            items={stat.items}
            showMoreText={stat.showMoreText}
            showMoreColor={stat.showMoreColor}
            onShowMore={stat.onShowMore}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SeccionEstadisticasRecientes;
