import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  TextField,
  Alert,
  Autocomplete
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DialogHorariosPrestador({ abierto, prestador, onCerrar, onGuardar, initialLugarIndex = 0, initialHorarioIndex = null, lockLugar = false }) {
  const [lugarIndex, setLugarIndex] = useState(0);
  const [selectedHorarioIndex, setSelectedHorarioIndex] = useState(null);
  const [local, setLocal] = useState(null);
  const lugares = useMemo(() => prestador?.lugaresAtencion || [], [prestador]);
  const especialidadesPrestador = useMemo(() => (
    Array.isArray(prestador?.especialidades) ? prestador.especialidades.filter(e => e && typeof e.id === 'number') : []
  ), [prestador]);

  useEffect(() => {
    if (abierto && prestador) {
      setLugarIndex(Number(initialLugarIndex) || 0);
      setSelectedHorarioIndex(
        initialHorarioIndex !== null && initialHorarioIndex !== undefined
          ? Number(initialHorarioIndex)
          : null
      );
      setLocal(JSON.parse(JSON.stringify(prestador)));
    }
  }, [abierto, prestador, initialLugarIndex, initialHorarioIndex]);

  // No preseleccionar especialidad; el usuario debe elegirla explícitamente

  if (!prestador || !local) return null;

  const handleSelectLugar = (idx) => {
    if (lockLugar) return;
    setLugarIndex(idx);
  };

  const agregarHorario = () => {
    const copia = JSON.parse(JSON.stringify(local));
    const l = copia.lugaresAtencion[lugarIndex];
    l.horarios = l.horarios || [];
    l.horarios.push({ dias: [], horaInicio: '', horaFin: '', duracionMinutos: 30, especialidadId: null });
    setLocal(copia);
  };

  const actualizarHorario = (hIndex, campo, valor) => {
    const copia = JSON.parse(JSON.stringify(local));
    copia.lugaresAtencion[lugarIndex].horarios[hIndex][campo] = valor;
    setLocal(copia);
  };

  const eliminarHorario = (hIndex) => {
    const copia = JSON.parse(JSON.stringify(local));
    const l = copia.lugaresAtencion[lugarIndex];
    l.horarios = (l.horarios || []).filter((_, i) => i !== hIndex);
    setLocal(copia);
  };

  const guardar = () => {
    onGuardar?.(local);
  };

  const lugarActual = local.lugaresAtencion[lugarIndex] || {};

  const handleEspecialidadLugar = (nueva) => {
    const copia = JSON.parse(JSON.stringify(local));
    copia.lugaresAtencion[lugarIndex].especialidadSeleccionada = nueva || null;
    setLocal(copia);
  };

  

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleIcon color="primary" />
          <Typography variant="h6">Gestionar Horarios</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <LocationOnIcon color="action" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Dirección</Typography>
            </Stack>
            {lockLugar ? (
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {local.lugaresAtencion[lugarIndex]?.direccion || `Lugar #${lugarIndex + 1}`}
              </Typography>
            ) : (
              <FormControl size="small" fullWidth>
                <InputLabel>Seleccionar Dirección</InputLabel>
                <Select
                  label="Seleccionar Dirección"
                  value={String(lugarIndex)}
                  onChange={(e) => handleSelectLugar(Number(e.target.value))}
                >
                  {local.lugaresAtencion.map((l, idx) => (
                    <MenuItem key={idx} value={String(idx)}>{l.direccion || `Lugar #${idx + 1}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Box sx={{ mt: 1.5 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Especialidad en esta dirección</InputLabel>
                <Select
                  label="Especialidad en esta dirección"
                  value={lugarActual.especialidadSeleccionada || ''}
                  onChange={(e) => handleEspecialidadLugar(e.target.value)}
                >
                  {especialidadesPrestador.map((esp) => (
                    <MenuItem key={esp.id} value={esp.nombre}>{esp.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{lugarActual.direccion || `Lugar #${lugarIndex + 1}`}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={agregarHorario} sx={{ textTransform: 'none', fontWeight: 700 }}>Agregar Horario</Button>
              </Stack>

              {(lugarActual.horarios || []).length === 0 && (
                <Alert severity="info">No hay horarios en esta dirección.</Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(lugarActual.horarios || []).map((h, hIdx) => (
                  <Card key={hIdx} variant="outlined" sx={{ p: 1.5, borderColor: selectedHorarioIndex === hIdx ? '#1976d2' : undefined, boxShadow: selectedHorarioIndex === hIdx ? 2 : 0 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                      <Autocomplete
                        multiple
                        options={diasSemana}
                        value={h.dias || []}
                        onChange={(e, newValue) => actualizarHorario(hIdx, 'dias', newValue)}
                        renderInput={(params) => (
                          <TextField {...params} label="Días" size="small" placeholder="Seleccione días" />
                        )}
                        sx={{ flex: 2, minWidth: 220 }}
                      />
                      <TextField
                        label="Inicio"
                        type="time"
                        value={h.horaInicio || ''}
                        onChange={(e) => actualizarHorario(hIdx, 'horaInicio', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="Fin"
                        type="time"
                        value={h.horaFin || ''}
                        onChange={(e) => actualizarHorario(hIdx, 'horaFin', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Duración (min)</InputLabel>
                        <Select
                          label="Duración (min)"
                          value={Number(h.duracionMinutos || 30)}
                          onChange={(e) => actualizarHorario(hIdx, 'duracionMinutos', Number(e.target.value))}
                        >
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={15}>15</MenuItem>
                          <MenuItem value={20}>20</MenuItem>
                          <MenuItem value={30}>30</MenuItem>
                          <MenuItem value={45}>45</MenuItem>
                          <MenuItem value={60}>60</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Especialidad</InputLabel>
                        <Select
                          label="Especialidad"
                          value={h.especialidadId ?? ''}
                          onChange={(e) => actualizarHorario(hIdx, 'especialidadId', e.target.value === '' ? null : Number(e.target.value))}
                        >
                          {especialidadesPrestador.map((esp) => (
                            <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton color="error" onClick={() => eliminarHorario(hIdx)} aria-label="Eliminar horario">
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCerrar} sx={{ textTransform: 'none', fontWeight: 700 }}>Cancelar</Button>
        <Button variant="contained" onClick={guardar} sx={{ textTransform: 'none', fontWeight: 700 }}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}


