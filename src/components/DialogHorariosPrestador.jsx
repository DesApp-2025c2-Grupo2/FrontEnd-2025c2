import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
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
import { selectPrestadores } from '../store/prestadoresSlice';
import * as agendasService from '../services/agendasService';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DialogHorariosPrestador({ abierto, prestador, onCerrar, onGuardar, initialLugarIndex = 0, initialHorarioIndex = null, lockLugar = false }) {
  const [lugarIndex, setLugarIndex] = useState(0);
  const [selectedHorarioIndex, setSelectedHorarioIndex] = useState(null);
  const [local, setLocal] = useState(null);
  const [selectedProfesionalId, setSelectedProfesionalId] = useState(null); // usado solo para modo "cargar desde prof" si quisiéramos
  const prestadores = useSelector(selectPrestadores);
  const profesionalesDelCentro = useMemo(() => {
    if (!prestador || prestador?.tipo !== 'Centro Médico') return [];
    const byLink = (prestadores || []).filter(p =>
      (p?.tipo === 'Profesional Independiente' || p?.rol === 1) && p?.integraCentroMedicoId === prestador.id
    );
    const idsFromCentro = Array.isArray(prestador?.profesionalesIds) ? new Set(prestador.profesionalesIds) : new Set();
    const byIds = (prestadores || []).filter(p =>
      (p?.tipo === 'Profesional Independiente' || p?.rol === 1) && idsFromCentro.has(p.id)
    );
    // Unir sin duplicados
    const map = new Map();
    [...byLink, ...byIds].forEach(p => { if (p && p.id != null) map.set(p.id, p); });
    return Array.from(map.values());
  }, [prestador, prestadores]);
  const especialidadesPrestador = useMemo(() => {
    // Para centro, no hay "especialidades del profesional" global. Usamos las del propio prestador local si existen.
    return Array.isArray(local?.especialidades) ? local.especialidades.filter(e => e && typeof e.id === 'number') : [];
  }, [local]);

  useEffect(() => {
    if (!abierto || !prestador) return;
    setLugarIndex(Number(initialLugarIndex) || 0);
    setSelectedHorarioIndex(
      initialHorarioIndex !== null && initialHorarioIndex !== undefined
        ? Number(initialHorarioIndex)
        : null
    );
    // En todos los casos partimos del prestador recibido como base (centro o profesional)
    setLocal(JSON.parse(JSON.stringify(prestador)));
  }, [abierto, prestador, initialLugarIndex, initialHorarioIndex]);

  // No preseleccionar especialidad; el usuario debe elegirla explícitamente

  if (!prestador || !local) return null;

  const handleSelectLugar = (idx) => {
    if (lockLugar) return;
    setLugarIndex(idx);
  };

  // Para centro, la asignación de profesional será por-horario (h.profesionalId).

  const agregarHorario = () => {
    const copia = JSON.parse(JSON.stringify(local));
    const l = copia.lugaresAtencion[lugarIndex];
    l.horarios = l.horarios || [];
    l.horarios.push({ dias: [], horaInicio: '', horaFin: '', duracionMinutos: 30, especialidadId: null, profesionalId: (prestador?.tipo === 'Centro Médico' ? null : prestador?.id || null) });
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
    // Validación y saneo antes de enviar
    const copia = JSON.parse(JSON.stringify(local));
    const lugares = Array.isArray(copia.lugaresAtencion) ? copia.lugaresAtencion : [];
    let totalValidos = 0;
    copia.lugaresAtencion = lugares.map((l) => {
      const hs = Array.isArray(l.horarios) ? l.horarios : [];
      const validos = hs.filter((h) => {
        const diasOK = Array.isArray(h.dias) && h.dias.length > 0;
        const hi = String(h.horaInicio || '').trim();
        const hf = String(h.horaFin || '').trim();
        const horasOK = hi !== '' && hf !== '' && hf > hi; // comparaciones de HH:mm funcionan como strings
        const profOK = (prestador?.tipo === 'Centro Médico') ? (typeof h.profesionalId === 'number') : true;
        return diasOK && horasOK && profOK;
      }).map((h) => {
        // Preferir la edición actual (especialidadId) sobre cualquier array previo
        const ids = (typeof h.especialidadId === 'number')
          ? [h.especialidadId]
          : (Array.isArray(h.especialidades) ? h.especialidades : []);
        return {
          id: h?.id ?? null,
          dias: h.dias,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
          duracionMinutos: typeof h.duracionMinutos === 'number' && h.duracionMinutos > 0 ? h.duracionMinutos : 30,
          especialidades: ids,
          profesionalId: (prestador?.tipo === 'Centro Médico') ? h.profesionalId : undefined
        };
      });
      totalValidos += validos.length;
      return { ...l, horarios: validos };
    });

    if (totalValidos === 0 && lugares.length > 0) {
      alert('Agrega al menos un horario válido (días, inicio y fin).');
      return;
    }

    // Si es centro, agrupar por profesional y retornar estructura especial para que el caller haga múltiples updates
    if (prestador?.tipo === 'Centro Médico') {
      const porProfesional = new Map();
      (copia.lugaresAtencion || []).forEach((l) => {
        const porLugar = (Array.isArray(l.horarios) ? l.horarios : []);
        porLugar.forEach((h) => {
          const pid = h.profesionalId;
          if (typeof pid !== 'number') return;
          const entrada = porProfesional.get(pid) || [];
          // Agrupar por dirección dentro del profesional
          let lugar = entrada.find(x => (String(x.direccion || '').trim().toLowerCase() === String(l.direccion || '').trim().toLowerCase()));
          if (!lugar) {
            lugar = { id: l.id ?? null, direccion: l.direccion || '', horarios: [] };
            entrada.push(lugar);
          }
          lugar.horarios.push({
            id: h.id ?? null,
            dias: h.dias,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            duracionMinutos: h.duracionMinutos,
            especialidadId: (Array.isArray(h.especialidades) && h.especialidades.length > 0) ? h.especialidades[0] : (h.especialidadId ?? null),
            profesionalId: pid
          });
          porProfesional.set(pid, entrada);
        });
      });
      const actualizacionesPorProfesional = {};
      porProfesional.forEach((value, key) => {
        actualizacionesPorProfesional[key] = value;
      });
      onGuardar?.({
        id: prestador.id,
        isCentro: true,
        actualizacionesPorProfesional
      });
      return;
    }

    onGuardar?.(copia);
  };

  const lugarActual = local.lugaresAtencion[lugarIndex] || {};

  

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleIcon color="primary" />
          <Typography variant="h6">Gestionar Horarios</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ flex: 1, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Para Centro Médico, la selección de profesional es por cada horario */}
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
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Horarios</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={agregarHorario} sx={{ textTransform: 'none', fontWeight: 700 }}>Agregar Horario</Button>
              </Stack>

              {(lugarActual.horarios || []).length === 0 && (
                <Alert severity="info">No hay horarios en esta dirección.</Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(lugarActual.horarios || []).map((h, hIdx) => (
                  <Card key={hIdx} variant="outlined" sx={{ p: 1.5, borderColor: selectedHorarioIndex === hIdx ? '#1976d2' : undefined, boxShadow: selectedHorarioIndex === hIdx ? 2 : 0 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                      {prestador?.tipo === 'Centro Médico' && (
                        <Autocomplete
                          size="small"
                          options={profesionalesDelCentro}
                          getOptionLabel={(o) => o?.nombreCompleto || ''}
                          isOptionEqualToValue={(o, v) => o?.id === v?.id}
                          value={profesionalesDelCentro.find(p => p.id === h.profesionalId) || null}
                          onChange={(e, newValue) => {
                            const copia = JSON.parse(JSON.stringify(local));
                            const pid = newValue ? newValue.id : null;
                            copia.lugaresAtencion[lugarIndex].horarios[hIdx].profesionalId = pid;
                            setLocal(copia);
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Profesional" placeholder="Elegir profesional" />
                          )}
                          sx={{ minWidth: 220 }}
                          noOptionsText="No hay profesionales asociados al centro"
                        />
                      )}
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
                      {(() => {
                        const inicio = h.horaInicio || '';
                        const fin = h.horaFin || '';
                        const intervaloInvalido = Boolean(inicio && fin && fin <= inicio);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 2, minWidth: 260 }}>
                            <TextField
                              label="Desde"
                              type="time"
                              value={inicio}
                              onChange={(e) => actualizarHorario(hIdx, 'horaInicio', e.target.value)}
                              size="small"
                              sx={{ width: 140 }}
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                            />
                            <Typography variant="body2" color="text.secondary">a</Typography>
                            <TextField
                              label="Hasta"
                              type="time"
                              value={fin}
                              onChange={(e) => actualizarHorario(hIdx, 'horaFin', e.target.value)}
                              size="small"
                              sx={{ width: 140 }}
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                              error={intervaloInvalido}
                              helperText={intervaloInvalido ? 'Fin debe ser mayor a inicio' : ''}
                            />
                          </Box>
                        );
                      })()}
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


