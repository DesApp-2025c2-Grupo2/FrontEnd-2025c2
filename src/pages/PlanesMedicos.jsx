import React, { useState } from 'react';
import { Box, Typography, Snackbar, CircularProgress, Alert } from '@mui/material';
import SearchField from '../components/Ui/SearchField.jsx';
import EstadoFilter from '../components/Ui/EstadoFilter.jsx';
import SnackbarMini from '../components/Ui/SnackbarMini.jsx';
import TarjetaPlan from '../components/TarjetaPlan.jsx';
import DialogoPlan from '../components/DialogoPlan.jsx';
import BotonFlotante from '../components/BotonFlotante.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { selectPlanesFiltrados, cargarPlanes, crearPlan, editarPlan, alternarPlanThunk } from '../store/planesSlice.js';
import { useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../components/Ui/PageHeader.jsx';


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
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('activos');

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
      setSnackbarSeverity('success');
    } else {
      dispatch(crearPlan(data));
      setSnackbarMessage('Plan agregado correctamente');
      setSnackbarSeverity('success');
    }
    setDialogOpen(false);
    setSnackbarOpen(true);
  };

  const planesFiltrados = planes
    .filter((p) => estado === 'todos' ? true : estado === 'activos' ? !!p.activo : !p.activo)
    .filter((plan) => {
    const texto = search.toLowerCase();
    return (
      (plan.nombre || '').toLowerCase().includes(texto) ||
      (plan.descripcion || '').toLowerCase().includes(texto) ||
      String(plan.moneda || '').toLowerCase().includes(texto)
    );
  });

  return (
    <>
      <PageHeader title="Planes Médicos" subtitle="Gestión de planes médicos y coberturas" />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
        <SearchField value={search} onChange={setSearch} placeholder="Buscar plan por nombre o descripción" />
        <EstadoFilter value={estado} onChange={setEstado} />
      </Box>

      <Box sx={{ mb: 8 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {planesFiltrados.map((plan) => (
          <TarjetaPlan
            key={plan.id}
            plan={plan}
            onEditar={handleOpenEdit}
            onAlternarActivo={(p) => {
              const seraActivo = !p.activo;
              dispatch(alternarPlanThunk({ id: p.id, activo: p.activo }));
              setSnackbarMessage(seraActivo ? 'Plan activado correctamente' : 'Plan desactivado correctamente');
              setSnackbarSeverity(seraActivo ? 'success' : 'warning');
              setSnackbarOpen(true);
            }}
          />
        ))}
      </Box>

      <DialogoPlan abierto={dialogOpen} onCerrar={handleClose} onGuardar={handleSubmit} valorInicial={editPlan} />

      <BotonFlotante onClick={handleOpenAdd} title="Agregar plan" />

      <SnackbarMini open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} />
    </>
  );
}

export default PlanesMedicos;