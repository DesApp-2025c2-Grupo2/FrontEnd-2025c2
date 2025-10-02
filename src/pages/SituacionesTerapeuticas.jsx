import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Container, Alert, CircularProgress, Snackbar } from '@mui/material';
import TarjetaSituacionTerapeutica from '../components/TarjetaSituacionTerapeutica.jsx';
import BotonFlotante from '../components/BotonFlotante';
import DialogSituacion from '../components/DialogSituacion.jsx';
import { cargarSituaciones, crearSituacion, editarSituacion, alternarSituacionThunk, selectSituaciones, selectSituacionesLoading, selectSituacionesError } from '../store/situacionesTerapeuticasSlice';

function SituacionesTerapeuticas() {
  const dispatch = useDispatch();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSituacion, setEditSituacion] = useState(null);
  

  const situaciones = useSelector(selectSituaciones);
  const loading = useSelector(selectSituacionesLoading);
  const error = useSelector(selectSituacionesError);

  useEffect(() => {
    dispatch(cargarSituaciones());
  }, [dispatch]);

  

  const handleOpenAdd = useCallback(() => {
    setEditSituacion(null);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((situacion) => {
    setEditSituacion(situacion);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => setDialogOpen(false), []);

  const handleToggleStatus = useCallback((situacion) => {
    dispatch(alternarSituacionThunk(situacion.id))
      .unwrap()
      .then((updated) => {
        setSnackbarMessage(updated.activa ? 'Situación activada correctamente' : 'Situación desactivada correctamente');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage('Ocurrió un error. Inténtalo nuevamente.');
        setSnackbarOpen(true);
      });
  }, [dispatch]);

  const handleSubmit = useCallback((data) => {
    if (editSituacion) {
      dispatch(editarSituacion({ ...data, id: editSituacion.id }))
        .unwrap()
        .then(() => {
          setSnackbarMessage('Situación actualizada correctamente');
          setSnackbarOpen(true);
        })
        .catch((e) => {
          setSnackbarMessage(e?.message || 'Error al actualizar');
          setSnackbarOpen(true);
        });
    } else {
      dispatch(crearSituacion(data))
        .unwrap()
        .then(() => {
          setSnackbarMessage('Situación agregada correctamente');
          setSnackbarOpen(true);
        })
        .catch((e) => {
          setSnackbarMessage(e?.message || 'Error al agregar');
          setSnackbarOpen(true);
        });
    }
    setDialogOpen(false);
  }, [dispatch, editSituacion]);

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
            <TarjetaSituacionTerapeutica
              key={situacion.id}
              situacion={situacion}
              onEditar={handleOpenEdit}
              onAlternarActiva={handleToggleStatus}
            />
          ))
        )}
      </Box>

      <DialogSituacion abierto={dialogOpen} valorInicial={editSituacion} onCerrar={handleCloseDialog} onGuardar={handleSubmit} />

      <BotonFlotante onClick={handleOpenAdd} title="Agregar situación" />

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