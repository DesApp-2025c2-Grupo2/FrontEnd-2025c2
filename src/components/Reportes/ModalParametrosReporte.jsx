import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Typography,
  Alert
} from '@mui/material';

export default function ModalParametrosReporte({
  open,
  tipoReporte,
  especialidades = [],
  onClose,
  onConfirm
}) {
  const [parametros, setParametros] = useState({});
  const [errors, setErrors] = useState({});

  // Resetear parámetros cuando cambia el tipo de reporte o se abre/cierra
  useEffect(() => {
    if (open) {
      // Inicializar parámetros según el tipo de reporte
      switch (tipoReporte) {
        case 'alta-afiliados-periodo':
        case 'alta-prestadores-periodo':
          setParametros({
            fechaDesde: '',
            fechaHasta: ''
          });
          break;
        case 'prestadores-especialidad-cp':
          setParametros({
            especialidades: [],
            codigoPostal: '' // Se convertirá a codigosPostales como array en el servicio si es necesario
          });
          break;
        case 'situaciones-terapeuticas-afiliado':
        case 'prestadores-sin-agendas':
          setParametros({});
          break;
        default:
          setParametros({});
      }
      setErrors({});
    }
  }, [open, tipoReporte]);

  const validarParametros = () => {
    const nuevosErrores = {};

    if (tipoReporte === 'alta-afiliados-periodo' || tipoReporte === 'alta-prestadores-periodo') {
      if (!parametros.fechaDesde || parametros.fechaDesde.trim() === '') {
        nuevosErrores.fechaDesde = 'La fecha desde es obligatoria';
      }
      if (!parametros.fechaHasta || parametros.fechaHasta.trim() === '') {
        nuevosErrores.fechaHasta = 'La fecha hasta es obligatoria';
      }
      if (parametros.fechaDesde && parametros.fechaHasta && parametros.fechaDesde.trim() !== '' && parametros.fechaHasta.trim() !== '') {
        if (new Date(parametros.fechaDesde) > new Date(parametros.fechaHasta)) {
          nuevosErrores.fechaHasta = 'La fecha hasta debe ser posterior a la fecha desde';
        }
      }
    }

    if (tipoReporte === 'prestadores-especialidad-cp') {
      if (parametros.codigoPostal && parametros.codigoPostal.trim() !== '') {
        const cp = parametros.codigoPostal.trim();
        if (!/^\d+$/.test(cp)) {
          nuevosErrores.codigoPostal = 'El código postal debe ser numérico';
        }
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleConfirm = () => {
    if (!validarParametros()) {
      return;
    }

    // Preparar parámetros para enviar
    const parametrosFinales = { ...parametros };

    // Las fechas ya vienen en formato ISO string (YYYY-MM-DD) desde el input type="date"
    // Solo asegurarnos de que están limpias
    if (parametrosFinales.fechaDesde) {
      parametrosFinales.fechaDesde = parametrosFinales.fechaDesde.trim();
    }
    if (parametrosFinales.fechaHasta) {
      parametrosFinales.fechaHasta = parametrosFinales.fechaHasta.trim();
    }

    // Convertir código postal a array si existe (el servicio espera codigosPostales como array)
    if (parametrosFinales.codigoPostal && parametrosFinales.codigoPostal.trim() !== '') {
      parametrosFinales.codigosPostales = [parametrosFinales.codigoPostal.trim()];
      delete parametrosFinales.codigoPostal;
    } else {
      delete parametrosFinales.codigoPostal;
    }

    // Convertir IDs de especialidades a nombres si existen
    if (parametrosFinales.especialidades && Array.isArray(parametrosFinales.especialidades)) {
      if (parametrosFinales.especialidades.length > 0) {
        parametrosFinales.especialidades = parametrosFinales.especialidades.map(id => {
          const esp = especialidades.find(e => e.id === id);
          return esp ? esp.nombre : id;
        });
      }
      // Si es array vacío, se mantiene vacío (puede ser "ninguna especialidad")
    }

    onConfirm(parametrosFinales);
  };

  const getTitulo = () => {
    const titulos = {
      'alta-afiliados-periodo': 'Alta de Afiliados por Período',
      'alta-prestadores-periodo': 'Alta de Prestadores por Período',
      'prestadores-especialidad-cp': 'Prestadores por Especialidad y CP',
      'situaciones-terapeuticas-afiliado': 'Situaciones Terapéuticas por Afiliado',
      'prestadores-sin-agendas': 'Prestadores sin Agendas'
    };
    return titulos[tipoReporte] || 'Parámetros del Reporte';
  };

  const tieneParametros = () => {
    return tipoReporte === 'alta-afiliados-periodo' ||
           tipoReporte === 'alta-prestadores-periodo' ||
           tipoReporte === 'prestadores-especialidad-cp';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
          {getTitulo()}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Configure los parámetros para generar el reporte
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {!tieneParametros() ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            Este reporte no requiere parámetros. Se generará con toda la información disponible.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Parámetros para reportes por período */}
            {(tipoReporte === 'alta-afiliados-periodo' || tipoReporte === 'alta-prestadores-periodo') && (
              <>
                <TextField
                  label="Fecha Desde"
                  type="date"
                  value={parametros.fechaDesde || ''}
                  onChange={(e) => {
                    setParametros({ ...parametros, fechaDesde: e.target.value });
                    if (errors.fechaDesde) {
                      setErrors({ ...errors, fechaDesde: '' });
                    }
                  }}
                  fullWidth
                  error={!!errors.fechaDesde}
                  helperText={errors.fechaDesde}
                  InputLabelProps={{
                    shrink: true
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa'
                    }
                  }}
                />

                <TextField
                  label="Fecha Hasta"
                  type="date"
                  value={parametros.fechaHasta || ''}
                  onChange={(e) => {
                    setParametros({ ...parametros, fechaHasta: e.target.value });
                    if (errors.fechaHasta) {
                      setErrors({ ...errors, fechaHasta: '' });
                    }
                  }}
                  fullWidth
                  error={!!errors.fechaHasta}
                  helperText={errors.fechaHasta}
                  InputLabelProps={{
                    shrink: true
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa'
                    }
                  }}
                />
              </>
            )}

              {/* Parámetros para prestadores por especialidad y CP */}
              {tipoReporte === 'prestadores-especialidad-cp' && (
                <>
                  <FormControl fullWidth>
                    <InputLabel id="especialidades-label">
                      Especialidades (ninguna, una o más de una)
                    </InputLabel>
                    <Select
                      labelId="especialidades-label"
                      multiple
                      value={parametros.especialidades || []}
                      onChange={(e) => {
                        setParametros({ ...parametros, especialidades: e.target.value });
                      }}
                      input={<OutlinedInput label="Especialidades (ninguna, una o más de una)" />}
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return <Typography variant="body2" color="text.secondary">Ninguna seleccionada</Typography>;
                        }
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const especialidad = especialidades.find(esp => esp.id === value);
                              return (
                                <Chip
                                  key={value}
                                  label={especialidad?.nombre || value}
                                  size="small"
                                  sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                                />
                              );
                            })}
                          </Box>
                        );
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fafafa'
                        }
                      }}
                    >
                      {especialidades.map((esp) => (
                        <MenuItem key={esp.id} value={esp.id}>
                          {esp.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Código Postal (CP numérico)"
                    value={parametros.codigoPostal || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir números
                      if (value === '' || /^\d+$/.test(value)) {
                        setParametros({ ...parametros, codigoPostal: value });
                        if (errors.codigoPostal) {
                          setErrors({ ...errors, codigoPostal: '' });
                        }
                      }
                    }}
                    error={!!errors.codigoPostal}
                    helperText={errors.codigoPostal || 'Opcional. Debe ser numérico'}
                    fullWidth
                    placeholder="Ej: 1000, 2000"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fafafa'
                      }
                    }}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#2563eb',
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              '&:hover': {
                backgroundColor: '#1d4ed8'
              }
            }}
          >
            Generar Reporte
          </Button>
        </DialogActions>
      </Dialog>
  );
}
