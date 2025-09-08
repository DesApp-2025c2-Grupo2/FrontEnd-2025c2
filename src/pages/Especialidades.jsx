import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Container, Alert, CircularProgress, Snackbar } from '@mui/material';
import EspecialidadCard from '../components/EspecialidadCard';
import BotonFlotante from '../components/BotonFlotante';
import { toggleEspecialidadStatus, addEspecialidad, selectEspecialidadesFiltradas, selectLoading, selectError } from '../store/especialidadesSlice';

function Especialidades() {
  const dispatch = useDispatch();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const especialidadesFiltradas = useSelector(selectEspecialidadesFiltradas);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const handleEdit = useCallback((especialidad) => {
    window.alert(`Editar especialidad: ${especialidad.nombre}`);
  }, []);

  const handleToggleStatus = useCallback((especialidad) => {
    dispatch(toggleEspecialidadStatus({ id: especialidad.id, activa: especialidad.activa }))
      .unwrap()
      .then((result) => {
        setSnackbarMessage(result.activa ? 'Especialidad activada correctamente' : 'Especialidad desactivada correctamente');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage('Ocurrió un error. Inténtalo nuevamente.');
        setSnackbarOpen(true);
      });
  }, [dispatch]);

  const handleAddEspecialidad = useCallback(() => {
    const nuevaEspecialidad = { nombre: 'Nueva Especialidad', descripcion: 'Descripción de la nueva especialidad' };
    dispatch(addEspecialidad(nuevaEspecialidad));
  }, [dispatch]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#2563eb', fontWeight: 700, mb: 1 }}>
          Especialidades
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Gestión de especialidades médicas
        </Typography>
      </Box>

      <Box sx={{ mb: 8 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {especialidadesFiltradas.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {'No hay especialidades registradas.'}
          </Alert>
        ) : (
          especialidadesFiltradas.map((especialidad) => (
            <EspecialidadCard
              key={especialidad.id}
              especialidad={especialidad}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </Box>

      <BotonFlotante onClick={handleAddEspecialidad} />

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarOpen}
        message={snackbarMessage}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
}

export default Especialidades;