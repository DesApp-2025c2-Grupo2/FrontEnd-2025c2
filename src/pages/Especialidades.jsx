import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Container, Alert, CircularProgress, Snackbar } from '@mui/material';
import EspecialidadCard from '../components/EspecialidadCard';
import BotonFlotante from '../components/BotonFlotante';
import { toggleEspecialidadStatus, addEspecialidad, updateEspecialidad, selectEspecialidadesFiltradas, selectLoading, selectError, cargarEspecialidades } from '../store/especialidadesSlice';
import DialogEspecialidad from '../components/DialogEspecialidad';

function Especialidades() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const especialidadesFiltradas = useSelector(selectEspecialidadesFiltradas);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(cargarEspecialidades());
  }, [dispatch]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Abrir modal si viene ?nuevo=1
  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      setEditing(null);
      setDialogOpen(true);
      searchParams.delete('nuevo');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleEdit = useCallback((especialidad) => {
    setEditing(especialidad);
    setDialogOpen(true);
  }, []);

  const handleToggleStatus = useCallback(async (especialidad) => {
    try {
      const result = await dispatch(toggleEspecialidadStatus({ id: especialidad.id, activa: especialidad.activa })).unwrap();
      setSnackbarMessage(result.activa ? 'Especialidad activada correctamente' : 'Especialidad desactivada correctamente');
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage('Ocurrió un error. Inténtalo nuevamente.');
      setSnackbarOpen(true);
    }
  }, [dispatch]);

  const handleAddEspecialidad = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const handleSave = async (esp) => {
    try {
      if (esp.id) {
        await dispatch(updateEspecialidad(esp)).unwrap();
      } else {
        await dispatch(addEspecialidad({ nombre: esp.nombre, descripcion: esp.descripcion })).unwrap();
      }
      setDialogOpen(false);
      setEditing(null);
      setSnackbarMessage('Especialidad guardada correctamente');
      setSnackbarOpen(true);
    } catch (e) {
      setSnackbarMessage(e?.message || 'Error al guardar la especialidad');
      setSnackbarOpen(true);
    }
  };

  

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

      <DialogEspecialidad
        abierto={dialogOpen}
        valorInicial={editing}
        onCerrar={() => { setDialogOpen(false); setEditing(null); }}
        onGuardar={handleSave}
      />

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