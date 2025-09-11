import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Container, Alert, CircularProgress, Snackbar } from '@mui/material';
import EspecialidadCard from '../components/EspecialidadCard';
import BotonFlotante from '../components/BotonFlotante';
import { toggleSituacionStatus, addSituacion, selectSituaciones, selectSituacionesLoading, selectSituacionesError } from '../store/situacionesTerapeuticasSlice';

function SituacionesTerapeuticas() {
  const dispatch = useDispatch();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  

  const situaciones = useSelector(selectSituaciones);
  const loading = useSelector(selectSituacionesLoading);
  const error = useSelector(selectSituacionesError);

  

  const handleEdit = useCallback((situacion) => {
    window.alert(`Editar situación: ${situacion.nombre}`);
  }, []);

  const handleToggleStatus = useCallback((situacion) => {
    dispatch(toggleSituacionStatus({ id: situacion.id, activa: situacion.activa }))
      .unwrap()
      .then((result) => {
        setSnackbarMessage(result.activa ? 'Situación activada correctamente' : 'Situación desactivada correctamente');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage('Ocurrió un error. Inténtalo nuevamente.');
        setSnackbarOpen(true);
      });
  }, [dispatch]);

  const handleAdd = useCallback(() => {
    const nueva = { nombre: 'Nueva Situación Terapéutica', descripcion: 'Descripción de la nueva situación' };
    dispatch(addSituacion(nueva));
  }, [dispatch]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#2563eb', fontWeight: 700, mb: 1 }}>
          Situaciones Terapéuticas
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Gestión de situaciones terapéuticas y tratamientos
        </Typography>
      </Box>

      

      <Box sx={{ mb: 8 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {situaciones.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {'No hay situaciones terapéuticas registradas.'}
          </Alert>
        ) : (
          situaciones.map((situacion) => (
            <EspecialidadCard
              key={situacion.id}
              especialidad={situacion}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              statusLabels={{ active: 'Activo', inactive: 'Inactivo' }}
            />
          ))
        )}
      </Box>

      <BotonFlotante onClick={handleAdd} />

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

export default SituacionesTerapeuticas;