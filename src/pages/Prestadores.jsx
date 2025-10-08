import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Divider,
  Fab,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import TarjetaPrestadorSimple from '../components/TarjetaPrestadorSimple';
import DialogPrestador from '../components/DialogPrestador';
import DialogVerPrestador from '../components/DialogVerPrestador';
import DialogHorariosPrestador from '../components/DialogHorariosPrestador';
import {
  selectPrestadoresFiltrados,
  selectPrestadoresLoading,
  selectPrestadoresError,
  cargarPrestadores,
  crearPrestador,
  editarPrestador,
  toggleActivoPrestador
} from '../store/prestadoresSlice';

function Prestadores() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogoAgregar, setDialogoAgregar] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoVer, setDialogoVer] = useState(false);
  const [dialogoHorarios, setDialogoHorarios] = useState(false);
  const [horariosContext, setHorariosContext] = useState({ lugarIndex: 0, horarioIndex: null });
  // Agenda creation was simplified and is not used directly from Prestadores
  const [confirmEliminarDireccion, setConfirmEliminarDireccion] = useState({ open: false, prestador: null, lugarIndex: null });
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Selectores de Redux
  const prestadoresFiltrados = useSelector(selectPrestadoresFiltrados(searchTerm));
  const loading = useSelector(selectPrestadoresLoading);
  const error = useSelector(selectPrestadoresError);

  // Cargar prestadores al montar el componente
  useEffect(() => {
    dispatch(cargarPrestadores());
  }, [dispatch]);

  // Abrir modal si viene ?nuevo=1
  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      setPrestadorSeleccionado(null);
      setDialogoAgregar(true);
      // limpiar query para evitar reabrir al navegar dentro
      searchParams.delete('nuevo');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Handlers para los botones
  const handleVer = (prestador) => {
    setPrestadorSeleccionado(prestador);
    setDialogoVer(true);
  };

  const handleEditar = (prestador) => {
    setPrestadorSeleccionado(prestador);
    setDialogoEditar(true);
  };

  const handleAgregarHorario = (prestador) => {
    setPrestadorSeleccionado(prestador);
    setHorariosContext({ lugarIndex: 0, horarioIndex: null });
    setDialogoHorarios(true);
  };

  const handleEditarHorario = (prestador, lugarIndex, horarioIndex) => {
    setPrestadorSeleccionado(prestador);
    setHorariosContext({ lugarIndex, horarioIndex });
    setDialogoHorarios(true);
  };

  const handleEliminarHorario = async (prestador, lugarIndex, horarioIndex) => {
    try {
      const copia = JSON.parse(JSON.stringify(prestador));
      if (!copia.lugaresAtencion || !copia.lugaresAtencion[lugarIndex]) return;
      const lugar = copia.lugaresAtencion[lugarIndex];
      if (!Array.isArray(lugar.horarios)) return;
      lugar.horarios = lugar.horarios.filter((_, idx) => idx !== horarioIndex);
      await dispatch(editarPrestador(copia)).unwrap();
      setSnackbar({ open: true, message: 'Horario eliminado', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'No se pudo eliminar el horario', severity: 'error' });
    }
  };

  const handleToggleActivo = async (prestador) => {
    try {
      await dispatch(toggleActivoPrestador(prestador.id)).unwrap();
      setSnackbar({
        open: true,
        message: `Prestador ${prestador.activo ? 'dado de baja' : 'rehabilitado'} exitosamente`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: typeof error === 'string' ? error : (error?.message || 'Error al cambiar estado del prestador'),
        severity: 'error'
      });
    }
  };

  const handleAgregar = () => {
    setPrestadorSeleccionado(null);
    setDialogoAgregar(true);
  };

  // Handlers para los diálogos
  const handleGuardarNuevo = async (nuevoPrestador) => {
    try {
      await dispatch(crearPrestador(nuevoPrestador)).unwrap();
      setDialogoAgregar(false);
      setSnackbar({
        open: true,
        message: 'Prestador creado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: typeof error === 'string' ? error : (error?.message || 'Error al crear el prestador'),
        severity: 'error'
      });
    }
  };

  const handleGuardarEdicion = async (prestadorEditado) => {
    try {
      await dispatch(editarPrestador(prestadorEditado)).unwrap();
      setDialogoEditar(false);
      setPrestadorSeleccionado(null);
      setSnackbar({
        open: true,
        message: 'Prestador actualizado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: typeof error === 'string' ? error : (error?.message || 'Error al actualizar el prestador'),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header de la página */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          color: '#1976d2',
          mb: { xs: 0.5, sm: 1 }, 
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2.125rem' }
        }}
      >
        Prestadores
      </Typography>
      <Typography 
        variant="subtitle1" 
        color="text.secondary" 
        gutterBottom 
        sx={{ 
          mb: { xs: 3, sm: 4 }, 
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}
      >
        Gestión de prestadores médicos y centros de salud
      </Typography>

      {/* Buscador unificado */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por nombre, CUIT/CUIL, especialidad, código postal, tipo o día de atención (ej: Lunes)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: { xs: 3, sm: 4 },
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }
        }}
      />

      {/* Lista de prestadores */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? error : (error?.message || String(error))}
          </Alert>
        ) : prestadoresFiltrados.length > 0 ? (
          prestadoresFiltrados.map((prestador) => (
            <TarjetaPrestadorSimple
              key={prestador.id}
              prestador={prestador}
              onVer={handleVer}
              onEditar={handleEditar}
              onToggleActivo={handleToggleActivo}
              onGestionarHorarios={(p, lugarIndex) => {
                setPrestadorSeleccionado(p);
                setHorariosContext({ lugarIndex, horarioIndex: null });
                setDialogoHorarios(true);
              }}
              onEliminarDireccion={async (p, lugarIndex) => {
                setConfirmEliminarDireccion({ open: true, prestador: p, lugarIndex });
              }}
              // Mostrar especialidad elegida por dirección
            />
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No se encontraron prestadores
            </Typography>
          </Box>
        )}
      </Box>

      {/* Botón flotante para agregar */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAgregar}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          width: { xs: 48, sm: 56 },
          height: { xs: 48, sm: 56 }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Diálogo Agregar Prestador */}
      <DialogPrestador
        abierto={dialogoAgregar}
        valorInicial={null}
        onCerrar={() => setDialogoAgregar(false)}
        onGuardar={handleGuardarNuevo}
        soloDirecciones={true}
      />

      {/* Diálogo Editar Prestador */}
      <DialogPrestador
        abierto={dialogoEditar}
        valorInicial={prestadorSeleccionado}
        onCerrar={() => {
          setDialogoEditar(false);
          setPrestadorSeleccionado(null);
        }}
        onGuardar={handleGuardarEdicion}
        soloDirecciones={true}
      />

      {/* Diálogo Ver Detalles */}
      <DialogVerPrestador
        abierto={dialogoVer}
        prestador={prestadorSeleccionado}
        onCerrar={() => {
          setDialogoVer(false);
          setPrestadorSeleccionado(null);
        }}
      />

      {/* Gestión de horarios por dirección (CRUD de disponibilidad + duración) */}
      {dialogoHorarios && prestadorSeleccionado && (
        <DialogHorariosPrestador
          abierto={dialogoHorarios}
          prestador={prestadorSeleccionado}
          initialLugarIndex={horariosContext.lugarIndex}
          initialHorarioIndex={horariosContext.horarioIndex}
          lockLugar={true}
          onCerrar={() => {
            setDialogoHorarios(false);
            setPrestadorSeleccionado(null);
            setHorariosContext({ lugarIndex: 0, horarioIndex: null });
          }}
          onGuardar={async (prestadorActualizado) => {
            try {
              await dispatch(editarPrestador(prestadorActualizado)).unwrap();
              setDialogoHorarios(false);
              setPrestadorSeleccionado(null);
              setSnackbar({ open: true, message: 'Horarios actualizados', severity: 'success' });
            } catch (error) {
              setSnackbar({ open: true, message: (typeof error === 'string' ? error : (error?.message || 'No se pudieron actualizar los horarios')), severity: 'error' });
            }
          }}
        />
      )}

      {/* Crear/editar agenda se realiza desde la pantalla de agendas, no desde Prestadores */}

      {/* Confirmación eliminar dirección */}
      <Dialog open={confirmEliminarDireccion.open} onClose={() => setConfirmEliminarDireccion({ open: false, prestador: null, lugarIndex: null })}>
        <DialogTitle>Eliminar dirección</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que deseas eliminar esta dirección y sus horarios?</Typography>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setConfirmEliminarDireccion({ open: false, prestador: null, lugarIndex: null })}>Cancelar</Button>
          <Button type="button" color="error" onClick={async () => {
            const { prestador, lugarIndex } = confirmEliminarDireccion;
            if (!prestador || lugarIndex == null) return;
            try {
              const copia = JSON.parse(JSON.stringify(prestador));
              copia.lugaresAtencion = (copia.lugaresAtencion || []).filter((_, i) => i !== lugarIndex);
              await dispatch(editarPrestador(copia)).unwrap();
              setSnackbar({ open: true, message: 'Dirección eliminada', severity: 'success' });
            } catch (error) {
              setSnackbar({ open: true, message: (typeof error === 'string' ? error : (error?.message || 'No se pudo eliminar la dirección')), severity: 'error' });
            } finally {
              setConfirmEliminarDireccion({ open: false, prestador: null, lugarIndex: null });
            }
          }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Prestadores;