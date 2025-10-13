import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

export default function SelectorReporte({
  tiposReportes = [],
  reporteSeleccionado,
  onSeleccionarReporte,
  onGenerarReporte,
  onExportarReporte,
  generandoReporte = false,
  exportandoReporte = false,
  error = null
}) {
  const handleGenerar = () => {
    if (reporteSeleccionado) {
      onGenerarReporte({
        tipoReporte: reporteSeleccionado,
        parametros: {} // Por ahora sin parámetros específicos
      });
    }
  };

  const handleExportar = () => {
    if (reporteSeleccionado) {
      onExportarReporte({
        tipoReporte: reporteSeleccionado,
        formato: 'PDF'
      });
    }
  };

  const tipoSeleccionado = tiposReportes.find(t => t.id === reporteSeleccionado);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          color: '#1f2937', 
          mb: 2,
          fontSize: '1.25rem'
        }}
      >
        Seleccionar Reporte
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} alignItems="flex-end">
        <FormControl sx={{ minWidth: 300, flexGrow: 1 }}>
          <InputLabel sx={{ fontWeight: 600, color: '#374151' }}>
            Tipo de Reporte
          </InputLabel>
          <Select
            value={reporteSeleccionado || ''}
            onChange={(e) => onSeleccionarReporte(e.target.value)}
            label="Tipo de Reporte"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#fafafa',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }
            }}
          >
            {tiposReportes.map((tipo) => (
              <MenuItem key={tipo.id} value={tipo.id}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {tipo.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tipo.descripcion}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={
            generandoReporte ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PlayArrowIcon />
            )
          }
          onClick={handleGenerar}
          disabled={!reporteSeleccionado || generandoReporte}
          sx={{
            backgroundColor: '#6b7280',
            color: 'white',
            fontWeight: 700,
            textTransform: 'none',
            px: 3,
            py: 1.5,
            '&:hover': {
              backgroundColor: '#4b5563'
            },
            '&:disabled': {
              backgroundColor: '#d1d5db',
              color: '#9ca3af'
            }
          }}
        >
          {generandoReporte ? 'GENERANDO...' : 'GENERAR'}
        </Button>

        <Button
          variant="contained"
          startIcon={
            exportandoReporte ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
          onClick={handleExportar}
          disabled={!reporteSeleccionado || exportandoReporte}
          sx={{
            backgroundColor: '#6b7280',
            color: 'white',
            fontWeight: 700,
            textTransform: 'none',
            px: 3,
            py: 1.5,
            '&:hover': {
              backgroundColor: '#4b5563'
            },
            '&:disabled': {
              backgroundColor: '#d1d5db',
              color: '#9ca3af'
            }
          }}
        >
          {exportandoReporte ? 'EXPORTANDO...' : 'EXPORTAR'}
        </Button>
      </Stack>

      {tipoSeleccionado && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {tipoSeleccionado.descripcion}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
