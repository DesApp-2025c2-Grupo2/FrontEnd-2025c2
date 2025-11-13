import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import SearchField from '../components/Ui/SearchField.jsx';
import EstadoFilter from '../components/Ui/EstadoFilter.jsx';
import SnackbarMini from '../components/Ui/SnackbarMini.jsx';
import TarjetaSituacionTerapeutica from '../components/TarjetaSituacionTerapeutica.jsx';
import BotonFlotante from '../components/BotonFlotante';
import DialogSituacion from '../components/DialogSituacion.jsx';
import { cargarSituaciones, crearSituacion, editarSituacion, alternarSituacionThunk, selectSituaciones, selectSituacionesLoading, selectSituacionesError } from '../store/situacionesTerapeuticasSlice';
import PageHeader from '../components/Ui/PageHeader.jsx';


function SituacionesTerapeuticas() {
  const dispatch = useDispatch();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSituacion, setEditSituacion] = useState(null);
  const [estado, setEstado] = useState('activos');
  const [search, setSearch] = useState('');
  

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
    dispatch(alternarSituacionThunk({ id: situacion.id, activa: situacion.activa }))
      .unwrap()
      .then((updated) => {
        setSnackbarMessage(updated.activa ? 'Situación activada correctamente' : 'Situación desactivada correctamente');
        setSnackbarSeverity(updated.activa ? 'success' : 'warning');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage('Ocurrió un error. Inténtalo nuevamente.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  }, [dispatch]);

  const handleSubmit = useCallback((data) => {
    if (editSituacion) {
      dispatch(editarSituacion({ ...data, id: editSituacion.id }))
        .unwrap()
        .then(() => {
          setSnackbarMessage('Situación actualizada correctamente');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        })
        .catch((e) => {
          setSnackbarMessage(e?.message || 'Error al actualizar');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    } else {
      dispatch(crearSituacion(data))
        .unwrap()
        .then(() => {
          setSnackbarMessage('Situación agregada correctamente');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        })
        .catch((e) => {
          setSnackbarMessage(e?.message || 'Error al agregar');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    }
    setDialogOpen(false);
  }, [dispatch, editSituacion]);

  return (
    <>
      <PageHeader title="Situaciones Terapéuticas" subtitle="Gestión de situaciones terapéuticas y tratamientos" />

      

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre o descripción" />
        <EstadoFilter value={estado} onChange={setEstado} />
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
          situaciones
            .filter((s) => estado === 'todos' ? true : estado === 'activos' ? !!s.activa : !s.activa)
            .filter((s) => {
              const t = search.toLowerCase();
              if (!t) return true;
              return (
                String(s.nombre || '').toLowerCase().includes(t) ||
                String(s.descripcion || '').toLowerCase().includes(t)
              );
            })
            .map((situacion) => (
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

      <SnackbarMini open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} />
    </>
  );
}

export default SituacionesTerapeuticas;