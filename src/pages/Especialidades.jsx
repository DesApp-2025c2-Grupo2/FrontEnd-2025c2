import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import SearchField from '../components/Ui/SearchField.jsx';
import EstadoFilter from '../components/Ui/EstadoFilter.jsx';
import SnackbarMini from '../components/Ui/SnackbarMini.jsx';
import EspecialidadCard from '../components/EspecialidadCard';
import BotonFlotante from '../components/BotonFlotante';
import { toggleEspecialidadStatus, addEspecialidad, updateEspecialidad, selectEspecialidadesFiltradas, selectLoading, selectError, cargarEspecialidades } from '../store/especialidadesSlice';
import DialogEspecialidad from '../components/DialogEspecialidad';
import PageHeader from '../components/Ui/PageHeader.jsx';


function Especialidades() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const especialidadesFiltradas = useSelector(selectEspecialidadesFiltradas);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(cargarEspecialidades());
  }, [dispatch]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [estado, setEstado] = useState('activos');
  const [search, setSearch] = useState('');

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
      setSnackbarSeverity(result.activa ? 'success' : 'warning');
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage('Ocurrió un error. Inténtalo nuevamente.');
      setSnackbarSeverity('error');
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
        await dispatch(addEspecialidad({ nombre: esp.nombre, descripcion: esp.descripcion, activa: esp.activa })).unwrap();
      }
      setDialogOpen(false);
      setEditing(null);
      setSnackbarMessage('Especialidad guardada correctamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (e) {
      setSnackbarMessage(e?.message || 'Error al guardar la especialidad');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  

  return (
    <>
      <PageHeader title="Especialidades" subtitle="Gestión de especialidades médicas" />

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

        {especialidadesFiltradas.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {'No hay especialidades registradas.'}
          </Alert>
        ) : (
          especialidadesFiltradas
            .filter((e) => estado === 'todos' ? true : estado === 'activos' ? !!e.activa : !e.activa)
            .filter((e) => {
              const t = search.toLowerCase();
              if (!t) return true;
              return (
                String(e.nombre || '').toLowerCase().includes(t) ||
                String(e.descripcion || '').toLowerCase().includes(t)
              );
            })
            .map((especialidad) => (
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

      <SnackbarMini open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} />
    </>
  );
}

export default Especialidades;