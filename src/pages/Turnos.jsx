import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import TarjetaAgendaTurnos from '../components/TarjetaAgendaTurnos';
import DialogAgenda from '../components/DialogAgenda';
import DialogVerAgenda from '../components/DialogVerAgenda';
import {
  selectAgendas,
  selectAgendasLoading,
  selectAgendasError,
  selectAgendasFiltradas,
  cargarAgendas,
  crearAgenda,
  editarAgenda,
  eliminarAgenda,
  toggleActivoAgenda,
  limpiarError
} from '../store/agendasSlice';
import {
  cargarPrestadores
} from '../store/prestadoresSlice';

function Turnos() {
  const dispatch = useDispatch();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogoAgregar, setDialogoAgregar] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoVer, setDialogoVer] = useState(false);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [agendaSeleccionada, setAgendaSeleccionada] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Selectores de Redux
  const agendasFiltradas = useSelector(selectAgendasFiltradas(searchTerm));
  const loading = useSelector(selectAgendasLoading);
  const error = useSelector(selectAgendasError);

  // Cargar agendas y prestadores al montar el componente
  useEffect(() => {
    dispatch(cargarAgendas());
    dispatch(cargarPrestadores());
  }, [dispatch]);

  // Handlers para los botones
  const handleVer = (agenda) => {
    setAgendaSeleccionada(agenda);
    setDialogoVer(true);
  };

  const handleEditar = (agenda) => {
    setAgendaSeleccionada(agenda);
    setDialogoEditar(true);
  };

  const handleToggleActivo = async (agenda) => {
    try {
      await dispatch(toggleActivoAgenda(agenda.id)).unwrap();
      setSnackbar({
        open: true,
        message: `Agenda ${agenda.activo ? 'desactivada' : 'activada'} exitosamente`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Error al cambiar estado de la agenda',
        severity: 'error'
      });
    }
  };

  const handleAgregar = () => {
    setAgendaSeleccionada(null);
    setDialogoAgregar(true);
  };

  // Handlers para los diálogos
  const handleGuardarNueva = async (nuevaAgenda) => {
    try {
      await dispatch(crearAgenda(nuevaAgenda)).unwrap();
      setDialogoAgregar(false);
      setSnackbar({
        open: true,
        message: 'Agenda creada exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Error al crear la agenda',
        severity: 'error'
      });
    }
  };

  const handleGuardarEdicion = async (agendaEditada) => {
    try {
      await dispatch(editarAgenda(agendaEditada)).unwrap();
      setDialogoEditar(false);
      setAgendaSeleccionada(null);
      setSnackbar({
        open: true,
        message: 'Agenda actualizada exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Error al actualizar la agenda',
        severity: 'error'
      });
    }
  };

  const handleConfirmarEliminar = async () => {
    try {
      await dispatch(eliminarAgenda(agendaSeleccionada.id)).unwrap();
      setDialogoEliminar(false);
      setAgendaSeleccionada(null);
      setSnackbar({
        open: true,
        message: 'Agenda eliminada exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Error al eliminar la agenda',
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
          color: '#2196f3',
          mb: { xs: 0.5, sm: 1 },
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2.125rem' }
        }}
      >
        Agendas de Turnos
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
        Configuración de disponibilidad de turnos por prestador
      </Typography>

      {/* Campo de búsqueda */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por prestador, especialidad o lugar... (presiona Enter)"
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

      {/* Lista de agendas */}
      <Box sx={{ mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : agendasFiltradas.length > 0 ? (
          agendasFiltradas.map((agenda, index) => (
            <Box key={agenda.id}>
              <TarjetaAgendaTurnos
                agenda={agenda}
                onVer={handleVer}
                onEditar={handleEditar}
                onToggleActivo={handleToggleActivo}
              />
              {/* Separador entre agendas */}
              {index < agendasFiltradas.length - 1 && (
                <Divider sx={{ my: { xs: 2, sm: 3 }, opacity: 0.6 }} />
              )}
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No se encontraron agendas de turnos
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
          backgroundColor: '#2196f3',
          '&:hover': { backgroundColor: '#1976d2' },
          width: { xs: 48, sm: 56 },
          height: { xs: 48, sm: 56 }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Diálogo Agregar Agenda */}
      <DialogAgenda
        abierto={dialogoAgregar}
        valorInicial={null}
        onCerrar={() => setDialogoAgregar(false)}
        onGuardar={handleGuardarNueva}
      />

      {/* Diálogo Editar Agenda */}
      <DialogAgenda
        abierto={dialogoEditar}
        valorInicial={agendaSeleccionada}
        onCerrar={() => {
          setDialogoEditar(false);
          setAgendaSeleccionada(null);
        }}
        onGuardar={handleGuardarEdicion}
      />

      {/* Diálogo Ver Detalles */}
      <DialogVerAgenda
        abierto={dialogoVer}
        agenda={agendaSeleccionada}
        onCerrar={() => {
          setDialogoVer(false);
          setAgendaSeleccionada(null);
        }}
      />

      {/* Diálogo Confirmar Eliminación */}
      <Dialog
        open={dialogoEliminar}
        onClose={() => setDialogoEliminar(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningIcon color="error" />
            <Typography variant="h6">Confirmar Eliminación</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            ¿Está seguro que desea dar de baja la agenda de turnos de{' '}
            <strong>{agendaSeleccionada?.prestador}</strong> para{' '}
            <strong>{agendaSeleccionada?.especialidad}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Esta acción eliminará todos los horarios configurados para esta agenda.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogoEliminar(false)}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminar}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Dar de Baja
          </Button>
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

export default Turnos;