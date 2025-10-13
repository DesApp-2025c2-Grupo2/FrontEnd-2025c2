import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import {
  generarReporte,
  exportarReporte,
  cargarHistorialReportes,
  seleccionarTipoReporte,
  limpiarError,
  selectTiposReportes,
  selectReporteSeleccionado,
  selectHistorialReportes,
  selectLoading,
  selectError,
  selectGenerandoReporte,
  selectExportandoReporte
} from '../store/reportesSlice';
import SelectorReporte from '../components/Reportes/SelectorReporte';
import HistorialReportes from '../components/Reportes/HistorialReportes';

function ConsultasReportes() {
  const dispatch = useDispatch();
  
  // Selectores de Redux
  const tiposReportes = useSelector(selectTiposReportes);
  const reporteSeleccionado = useSelector(selectReporteSeleccionado);
  const historialReportes = useSelector(selectHistorialReportes);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const generandoReporte = useSelector(selectGenerandoReporte);
  const exportandoReporte = useSelector(selectExportandoReporte);
  
  // Estado local
  const [reporteExportando, setReporteExportando] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(cargarHistorialReportes());
  }, [dispatch]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarOpen(true);
      dispatch(limpiarError());
    }
  }, [error, dispatch]);

  // Handlers
  const handleSeleccionarReporte = (tipoReporte) => {
    dispatch(seleccionarTipoReporte(tipoReporte));
  };

  const handleGenerarReporte = async (datos) => {
    try {
      await dispatch(generarReporte(datos)).unwrap();
      setSnackbarMessage('Reporte generado exitosamente');
      setSnackbarOpen(true);
    } catch (error) {
      // El error se maneja en el useEffect anterior
    }
  };

  const handleExportarReporte = async (datos) => {
    try {
      setReporteExportando(datos.reporteId);
      await dispatch(exportarReporte(datos)).unwrap();
      setSnackbarMessage('Reporte exportado exitosamente');
      setSnackbarOpen(true);
    } catch (error) {
      // El error se maneja en el useEffect anterior
    } finally {
      setReporteExportando(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: '#1f2937',
            mb: 1
          }}
        >
          Consultas y Reportes
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b7280',
            fontSize: '1.1rem'
          }}
        >
          Análisis y estadísticas del sistema
        </Typography>
      </Box>

      {/* Selector de Reportes */}
      <SelectorReporte
        tiposReportes={tiposReportes}
        reporteSeleccionado={reporteSeleccionado}
        onSeleccionarReporte={handleSeleccionarReporte}
        onGenerarReporte={handleGenerarReporte}
        onExportarReporte={handleExportarReporte}
        generandoReporte={generandoReporte}
        exportandoReporte={exportandoReporte}
        error={error}
      />

      {/* Historial de Reportes */}
      <HistorialReportes
        historialReportes={historialReportes}
        onExportarReporte={handleExportarReporte}
        exportandoReporte={exportandoReporte}
        reporteExportando={reporteExportando}
      />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ConsultasReportes;