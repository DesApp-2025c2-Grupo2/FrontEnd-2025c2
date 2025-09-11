import React from 'react';
import { Box, Container } from '@mui/material';
import SeccionAccionesRapidas from '../components/SeccionAccionesRapidas';
import SeccionEstadisticasRecientes from '../components/SeccionEstadisticasRecientes';
import { useAccionesRapidas } from '../hooks/useAccionesRapidas.jsx';
import { useEstadisticasRecientes } from '../hooks/useEstadisticasRecientes.jsx';

function Dashboard() {
  const { actions: quickActions } = useAccionesRapidas('dashboard');
  const { stats: recentStats } = useEstadisticasRecientes('dashboard');

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box>
        <SeccionAccionesRapidas actions={quickActions} />
        <SeccionEstadisticasRecientes stats={recentStats} />
      </Box>
    </Container>
  );
}

export default Dashboard;