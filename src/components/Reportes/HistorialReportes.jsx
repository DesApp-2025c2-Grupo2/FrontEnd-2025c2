import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

export default function HistorialReportes({
  historialReportes = [],
  onExportarReporte,
  exportandoReporte = false,
  reporteExportando = null
}) {
  const formatFecha = (fechaISO) => {
    if (!fechaISO) return null;
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'completado':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'generado':
        return <ScheduleIcon color="warning" fontSize="small" />;
      default:
        return <AccessTimeIcon color="action" fontSize="small" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completado':
        return 'success';
      case 'generado':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'generado':
        return 'Generado';
      default:
        return 'Pendiente';
    }
  };

  return (
    <Box>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          color: '#1f2937', 
          mb: 2,
          fontSize: '1.25rem'
        }}
      >
        Reportes recientes
      </Typography>

      {historialReportes.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          backgroundColor: '#f8fafc',
          borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}>
          <BarChartIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No hay reportes generados aún
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Selecciona un tipo de reporte y haz clic en "GENERAR" para crear tu primer reporte
          </Typography>
        </Box>
      ) : (
        <List sx={{ backgroundColor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          {historialReportes.map((reporte, index) => (
            <React.Fragment key={reporte.id}>
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 48 }}>
                  <BarChartIcon sx={{ color: '#6b7280' }} />
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                        {reporte.nombre}
                      </Typography>
                      <Chip
                        icon={getEstadoIcon(reporte.estado)}
                        label={getEstadoTexto(reporte.estado)}
                        size="small"
                        color={getEstadoColor(reporte.estado)}
                        variant="outlined"
                      />
                      {reporte.formatoExportacion && (
                        <Chip
                          label={reporte.formatoExportacion}
                          size="small"
                          variant="outlined"
                          sx={{ color: '#6b7280', borderColor: '#d1d5db' }}
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Generado el:</strong> {formatFecha(reporte.fechaGeneracion)}
                      </Typography>
                      {reporte.fechaExportacion && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Exportado el:</strong> {formatFecha(reporte.fechaExportacion)}
                        </Typography>
                      )}
                      {Object.keys(reporte.parametros || {}).length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Parámetros:
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {Object.entries(reporte.parametros).map(([key, value]) => (
                              <Chip
                                key={key}
                                label={`${key}: ${Array.isArray(value) ? value.join(', ') : value}`}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  mr: 0.5, 
                                  mb: 0.5,
                                  fontSize: '0.75rem',
                                  height: 20
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  }
                />

                <Box sx={{ ml: 2 }}>
                  <Tooltip title="Exportar reporte">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => onExportarReporte({
                        reporteId: reporte.id,
                        formato: 'PDF'
                      })}
                      disabled={exportandoReporte && reporteExportando === reporte.id}
                      sx={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        '&:hover': {
                          backgroundColor: '#1d4ed8'
                        },
                        '&:disabled': {
                          backgroundColor: '#d1d5db',
                          color: '#9ca3af'
                        }
                      }}
                    >
                      EXPORTAR
                    </Button>
                  </Tooltip>
                </Box>
              </ListItem>
              
              {index < historialReportes.length - 1 && (
                <Divider sx={{ mx: 3 }} />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}
