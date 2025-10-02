import React, { useMemo, useState } from 'react';
import { Box, Container } from '@mui/material';
import SeccionAccionesRapidas from '../components/SeccionAccionesRapidas';
import SeccionEstadisticasRecientes from '../components/SeccionEstadisticasRecientes';
import { useEstadisticasRecientes } from '../hooks/useEstadisticasRecientes.jsx';
import { PersonAdd, LocalHospital, MedicalServices } from '@mui/icons-material';
import DialogPrestador from '../components/DialogPrestador';
import DialogEspecialidad from '../components/DialogEspecialidad';
import DialogAgregarAfiliado from '../components/DialogAgregarAfiliado';
import { useDispatch } from 'react-redux';
import { crearPrestador } from '../store/prestadoresSlice';
import { addEspecialidad } from '../store/especialidadesSlice';

function Dashboard() {
  const { stats: recentStats } = useEstadisticasRecientes('dashboard');
  const dispatch = useDispatch();

  const [openPrestador, setOpenPrestador] = useState(false);
  const [openEspecialidad, setOpenEspecialidad] = useState(false);
  const [openAfiliado, setOpenAfiliado] = useState(false);

  const actions = useMemo(() => ([
    {
      title: 'Nuevo Afiliado',
      subtitle: 'Agregar afiliado titular',
      icon: <PersonAdd />,
      backgroundColor: '#28a745',
      onClick: () => setOpenAfiliado(true),
    },
    {
      title: 'Nuevo Prestador',
      subtitle: 'Registrar prestador médico',
      icon: <LocalHospital />,
      backgroundColor: '#6f42c1',
      onClick: () => setOpenPrestador(true),
    },
    {
      title: 'Nueva Especialidad',
      subtitle: 'Agregar especialidad médica',
      icon: <MedicalServices />,
      backgroundColor: '#007bff',
      onClick: () => setOpenEspecialidad(true),
    },
  ]), []);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box>
        <SeccionAccionesRapidas actions={actions} />
        <SeccionEstadisticasRecientes stats={recentStats} />
      </Box>

      {/* Modal Nuevo Prestador */}
      <DialogPrestador
        abierto={openPrestador}
        valorInicial={null}
        onCerrar={() => setOpenPrestador(false)}
        onGuardar={async (nuevo) => {
          await dispatch(crearPrestador(nuevo));
          setOpenPrestador(false);
        }}
      />

      {/* Modal Nueva Especialidad */}
      <DialogEspecialidad
        abierto={openEspecialidad}
        valorInicial={null}
        onCerrar={() => setOpenEspecialidad(false)}
        onGuardar={async (esp) => {
          await dispatch(addEspecialidad({ nombre: esp.nombre, descripcion: esp.descripcion }));
          setOpenEspecialidad(false);
        }}
      />

      {/* Modal Nuevo Afiliado (placeholder básico) */}
      <DialogAgregarAfiliado
        open={openAfiliado}
        onClose={() => setOpenAfiliado(false)}
        grupo={{ nombre: 'Demo', planMedico: 1 }}
        planes={[{ id: 1, nombre: 'Plan 310' }]}
      />
    </Container>
  );
}

export default Dashboard;