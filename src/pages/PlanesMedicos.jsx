import React, { useState } from 'react';
import { Container, Box, Typography, Snackbar, CircularProgress, Alert } from '@mui/material';
import TarjetaPlan from '../components/TarjetaPlan.jsx';
import DialogoPlan from '../components/DialogoPlan.jsx';
import BotonFlotante from '../components/BotonFlotante.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { selectPlanesFiltrados, cargarPlanes, crearPlan, editarPlan, eliminarPlanThunk, alternarPlanThunk } from '../store/planesSlice.js';
import { useEffect } from 'react';

function PlanesMedicos() {
  const dispatch = useDispatch();
  const planes = useSelector(selectPlanesFiltrados);
  const loading = useSelector((s) => s.planes.loading);
  const error = useSelector((s) => s.planes.error);
  useEffect(() => {
    dispatch(cargarPlanes());
  }, [dispatch]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleOpenAdd = () => {
    setEditPlan(null);
    setDialogOpen(true);
  };
  const handleOpenEdit = (plan) => {
    setEditPlan(plan);
    setDialogOpen(true);
  };
  const handleClose = () => setDialogOpen(false);

  const handleSubmit = (data) => {
    if (editPlan) {
      dispatch(editarPlan({ ...data, id: editPlan.id }));
      setSnackbarMessage('Plan actualizado correctamente');
    } else {
      dispatch(crearPlan(data));
      setSnackbarMessage('Plan agregado correctamente');
    }
    setDialogOpen(false);
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#2563eb', fontWeight: 700, mb: 1 }}>
          Planes Médicos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Gestión de planes médicos y coberturas
        </Typography>
      </Box>

      <Box sx={{ mb: 8 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {planes.map((plan) => (
          <TarjetaPlan
            key={plan.id}
            plan={plan}
            onEditar={handleOpenEdit}
            onAlternarActivo={(p) => {
              // El nuevo estado será el opuesto al actual
              const seraActivo = !p.activo;
              dispatch(alternarPlanThunk(p.id));
              setSnackbarMessage(seraActivo ? 'Plan activado correctamente' : 'Plan desactivado correctamente');
              setSnackbarOpen(true);
            }}
          />
        ))}
      </Box>

      <DialogoPlan abierto={dialogOpen} onCerrar={handleClose} onGuardar={handleSubmit} valorInicial={editPlan} />

      <BotonFlotante onClick={handleOpenAdd} title="Agregar plan" />

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

export default PlanesMedicos;