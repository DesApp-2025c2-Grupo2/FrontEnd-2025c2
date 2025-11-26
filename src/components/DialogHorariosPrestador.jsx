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
  Autocomplete,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { selectPrestadores } from '../store/prestadoresSlice';
import * as agendasService from '../services/agendasService';
import * as prestadoresService from '../services/prestadoresService';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DialogHorariosPrestador({ abierto, prestador, onCerrar, onGuardar, initialLugarIndex = 0, initialHorarioIndex = null, lockLugar = false }) {
  const [lugarIndex, setLugarIndex] = useState(0);
  const [selectedHorarioIndex, setSelectedHorarioIndex] = useState(null);
  const [local, setLocal] = useState(null);
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [profesionalesCentroAll, setProfesionalesCentroAll] = useState([]);
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
    // Profesionales traídos explícitamente de backend (getAll), filtrados por centro
    const fromBackend = (profesionalesCentroAll || []).filter(p =>
      (p?.tipo === 'Profesional Independiente' || p?.rol === 1) && p?.integraCentroMedicoId === prestador.id
    );
    // Unir sin duplicados
    const map = new Map();
    [...byLink, ...byIds, ...fromBackend].forEach(p => { if (p && p.id != null) map.set(p.id, p); });
    return Array.from(map.values());
  }, [prestador, prestadores, profesionalesCentroAll]);
  const especialidadesPrestador = useMemo(() => {
    // Para centro, no hay "especialidades del profesional" global. Usamos las del propio prestador local si existen.
    return Array.isArray(local?.especialidades) ? local.especialidades.filter(e => e && typeof e.id === 'number') : [];
  }, [local]);

  const idToNombreProfesional = useMemo(() => {
    const map = new Map();
    (profesionalesDelCentro || []).forEach(p => { if (p && typeof p.id === 'number' && p.nombreCompleto) map.set(p.id, p.nombreCompleto); });
    (profesionalesCentroAll || []).forEach(p => { if (p && typeof p.id === 'number' && p.nombreCompleto && !map.has(p.id)) map.set(p.id, p.nombreCompleto); });
    return map;
  }, [profesionalesDelCentro, profesionalesCentroAll]);
  useEffect(() => {
    if (!abierto || !prestador) return;
    setLugarIndex(Number(initialLugarIndex) || 0);
    setSelectedHorarioIndex(
      initialHorarioIndex !== null && initialHorarioIndex !== undefined
        ? Number(initialHorarioIndex)
        : null
    );

    async function init() {
      // profesional independiente
      if (prestador?.tipo !== 'Centro Médico') {
        setLocal(JSON.parse(JSON.stringify(prestador)));
        return;
      }
      // Centro: cargar todas las agendas y unificarlas por dirección
      try {
        const profList = await agendasService.getByCentro(prestador.id);
        // Cargar profesionales completos desde backend para opciones del selector
        try {
          const all = await prestadoresService.getAll();
          setProfesionalesCentroAll(Array.isArray(all) ? all : []);
        } catch {
          setProfesionalesCentroAll([]);
        }
        const lugares = [];
        const canonDir = (s) => {
          return String(s || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\b(s\/?n|s\/?d)\b/gi, '')
            .replace(/[,.;\-–—]+$/g, '')
            .trim()
            .toLowerCase();
        };
        const keyMap = new Map(); // key -> index
        const add = (dir, h, pid, lugarId) => {
          const key = (typeof lugarId === 'number') ? `id:${lugarId}` : `dir:${canonDir(dir)}`;
          let idx = keyMap.get(key);
          if (idx === undefined) {
            idx = lugares.length;
            keyMap.set(key, idx);
            lugares.push({ id: (typeof lugarId === 'number' ? lugarId : null), direccion: dir, horarios: [] });
          }
          const lista = lugares[idx].horarios;
          const dias = Array.isArray(h?.dias) ? h.dias : (Array.isArray(h?.diasDeLaSemana) ? h.diasDeLaSemana : []);
          const espId = (Array.isArray(h?.especialidades) && h.especialidades.length > 0)
            ? h.especialidades[0]
            : ((typeof h?.especialidadId === 'number') ? h.especialidadId : null);
          const dupKey = JSON.stringify({ d: [...dias].sort(), hi: h?.horaInicio || h?.desde, hf: h?.horaFin || h?.hasta, pid, esp: espId });
          const exists = lista.some(x => {
            const xd = Array.isArray(x?.dias) ? x.dias : (Array.isArray(x?.diasDeLaSemana) ? x.diasDeLaSemana : []);
            const xEsp = (Array.isArray(x?.especialidades) && x.especialidades.length > 0) ? x.especialidades[0] : ((typeof x?.especialidadId === 'number') ? x.especialidadId : null);
            const xKey = JSON.stringify({ d: [...xd].sort(), hi: x?.horaInicio || x?.desde, hf: x?.horaFin || x?.hasta, pid: x?.profesionalId, esp: xEsp });
            return xKey === dupKey;
          });
        if (!exists) lista.push({ ...h, profesionalId: pid, lugarId: (typeof lugarId === 'number' ? lugarId : (typeof h?.lugarId === 'number' ? h.lugarId : null)) });
        };
        if (Array.isArray(profList) && profList.length > 0) {
          profList.forEach(pr => {
            (pr?.direcciones || []).forEach(l => {
              const hs = Array.isArray(l?.horarios) ? l.horarios : (Array.isArray(l?.horariosAtencion) ? l.horariosAtencion : []);
              hs.forEach(h => add(l?.direccion || '', h, pr.profesionalId, l?.id ?? l?.lugarId ?? null));
            });
          });
        } else {
          // Fallback fan-out
          const reqs = (profesionalesDelCentro || []).map(p =>
            agendasService.getByProfesional(p.id).then((dirs) => ({ p, dirs: Array.isArray(dirs) ? dirs : [] })).catch(() => ({ p, dirs: [] }))
          );
          const arr = await Promise.all(reqs);
          arr.forEach(({ p, dirs }) => {
            (dirs || []).forEach(l => {
              const hs = Array.isArray(l?.horarios) ? l.horarios : (Array.isArray(l?.horariosAtencion) ? l.horariosAtencion : []);
              hs.forEach(h => add(l?.direccion || '', h, p.id, l?.id ?? l?.lugarId ?? null));
            });
          });
        }
        setLocal({ ...prestador, lugaresAtencion: lugares });
        setLugarIndex(0);
      } catch {
        setLocal({ ...prestador, lugaresAtencion: [] });
      }
    }
    init();
  }, [abierto, prestador, initialLugarIndex, initialHorarioIndex, profesionalesDelCentro]);

  // No preseleccionar especialidad; el usuario debe elegirla explícitamente

  if (!prestador || !local) return null;

  const handleSelectLugar = (idx) => {
    if (lockLugar) return;
    setLugarIndex(idx);
  };

  const agregarDireccionCentro = () => {
    if (prestador?.tipo !== 'Centro Médico') return;
    const dir = String(nuevaDireccion || '').trim();
    if (!dir) return;
    const copia = JSON.parse(JSON.stringify(local || { lugaresAtencion: [] }));
    const exists = (Array.isArray(copia.lugaresAtencion) ? copia.lugaresAtencion : []).some(
      (l) => String(l?.direccion || '').trim().toLowerCase() === dir.toLowerCase()
    );
    if (exists) {
      // Seleccionar la existente
      const idx = copia.lugaresAtencion.findIndex((l) => String(l?.direccion || '').trim().toLowerCase() === dir.toLowerCase());
      if (idx >= 0) setLugarIndex(idx);
      setNuevaDireccion('');
      return;
    }
    copia.lugaresAtencion = Array.isArray(copia.lugaresAtencion) ? copia.lugaresAtencion : [];
    copia.lugaresAtencion.push({ id: null, direccion: dir, horarios: [] });
    setLocal(copia);
    setLugarIndex(copia.lugaresAtencion.length - 1);
    setNuevaDireccion('');
  };

  // Para centro: se ven todos los horarios por dirección; el profesional solo se elige al crear uno nuevo

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

  const eliminarHorario = async (hIndex) => {
    const h = local?.lugaresAtencion?.[lugarIndex]?.horarios?.[hIndex];
    const l = local?.lugaresAtencion?.[lugarIndex];
    // Intentar eliminación inmediata en backend si hay ids
    try {
      if (h && typeof h?.id === 'number') {
        if (prestador?.tipo === 'Centro Médico') {
          const profId = h?.profesionalId;
          const lugarId = (typeof h?.lugarId === 'number') ? h.lugarId : (typeof l?.id === 'number' ? l.id : null);
          if (typeof profId === 'number' && typeof lugarId === 'number') {
            await agendasService.deleteHorario(profId, lugarId, h.id);
          }
        } else if (typeof prestador?.id === 'number' && typeof l?.id === 'number') {
          await agendasService.deleteHorario(prestador.id, l.id, h.id);
        }
      }
    } catch (_) {
      // si falla, igualmente removemos local y que el PUT corrija
    }
    const copia = JSON.parse(JSON.stringify(local));
    const l2 = copia.lugaresAtencion[lugarIndex];
    l2.horarios = (l2.horarios || []).filter((_, i) => i !== hIndex);
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
        return diasOK && horasOK;
      }).map((h) => {
        // Preferir la edición actual (especialidadId) sobre cualquier array previo
        const ids = (typeof h.especialidadId === 'number')
          ? [h.especialidadId]
          : (Array.isArray(h.especialidades) ? h.especialidades : []);
        const item = {
          id: h?.id ?? null,
          dias: h.dias,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
          duracionMinutos: typeof h.duracionMinutos === 'number' && h.duracionMinutos > 0 ? h.duracionMinutos : 30,
          especialidades: ids
        };
        // Para centros necesitamos conservar profesionalId para poder agrupar por profesional al guardar
        if (prestador?.tipo === 'Centro Médico') {
          item.profesionalId = (typeof h?.profesionalId === 'number') ? h.profesionalId : null;
        }
        return item;
      });
      totalValidos += validos.length;
      return { ...l, horarios: validos };
    });

    if (totalValidos === 0 && lugares.length > 0) {
      alert('Agrega al menos un horario válido (días, inicio y fin).');
      return;
    }

    // Si es centro, agrupar por profesional y retornar estructura para múltiples updates
    if (prestador?.tipo === 'Centro Médico') {
      const porProfesional = new Map();
      (copia.lugaresAtencion || []).forEach((l) => {
        const hs = Array.isArray(l?.horarios) ? l.horarios : [];
        hs.forEach((h) => {
          const pid = h?.profesionalId;
          if (typeof pid !== 'number') return;
          const arr = porProfesional.get(pid) || [];
          // agrupar por dirección
          let lugar = arr.find(x => String(x.direccion || '').trim().toLowerCase() === String(l.direccion || '').trim().toLowerCase());
          if (!lugar) {
            lugar = { id: l?.id ?? null, direccion: l?.direccion || '', horarios: [] };
            arr.push(lugar);
          }
          lugar.horarios.push({
            id: h?.id ?? null,
            dias: h.dias,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            duracionMinutos: h.duracionMinutos,
            especialidadId: (Array.isArray(h.especialidades) && h.especialidades.length > 0) ? h.especialidades[0] : (h.especialidadId ?? null)
          });
          porProfesional.set(pid, arr);
        });
      });
      const actualizacionesPorProfesional = {};
      porProfesional.forEach((value, key) => { actualizacionesPorProfesional[key] = value; });
      onGuardar?.({ id: prestador.id, isCentro: true, actualizacionesPorProfesional });
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
          {/* Para Centro Médico, no mostramos selector global de profesional */}
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
              <>
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
                {prestador?.tipo === 'Centro Médico' && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mt: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Nueva dirección del centro"
                      placeholder="Ej: Av. Siempre Viva 742"
                      value={nuevaDireccion}
                      onChange={(e) => setNuevaDireccion(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarDireccionCentro(); } }}
                    />
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={agregarDireccionCentro} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
                      Agregar dirección
                    </Button>
                  </Stack>
                )}
              </>
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
                  <Card key={hIdx} variant="outlined" sx={{ p: 1.25, borderColor: selectedHorarioIndex === hIdx ? '#1976d2' : undefined, boxShadow: selectedHorarioIndex === hIdx ? 2 : 0 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minWidth: 220, '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}>
                        {diasSemana.map((d) => (
                          <FormControlLabel
                            key={d}
                            control={
                              <Checkbox
                                size="small"
                                checked={Array.isArray(h.dias) ? h.dias.includes(d) : false}
                                onChange={() => {
                                  const arr = Array.isArray(h.dias) ? [...h.dias] : [];
                                  const i = arr.indexOf(d);
                                  if (i >= 0) arr.splice(i, 1); else arr.push(d);
                                  actualizarHorario(hIdx, 'dias', arr);
                                }}
                              />
                            }
                            label={<Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{d}</Typography>}
                          />
                        ))}
                      </Box>
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
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>a</Typography>
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
                      {prestador?.tipo === 'Centro Médico' && (
                        <Box sx={{ minWidth: 220 }}>
                          {/* Selección de profesional SOLO cuando es nuevo (sin id) */}
                          {h.id == null ? (
                            <Autocomplete
                              size="small"
                              options={(() => {
                                const espSel = h?.especialidadId;
                                const base = profesionalesDelCentro || [];
                                if (typeof espSel === 'number') {
                                  return base.filter(p =>
                                    Array.isArray(p?.especialidades) && p.especialidades.some(e => e && e.id === espSel)
                                  );
                                }
                                return base;
                              })()}
                              getOptionLabel={(o) => o?.nombreCompleto || ''}
                              isOptionEqualToValue={(o, v) => o?.id === v?.id}
                              value={profesionalesDelCentro.find(p => p.id === h.profesionalId) || null}
                              onChange={(e, newValue) => {
                                const copia = JSON.parse(JSON.stringify(local));
                                copia.lugaresAtencion[lugarIndex].horarios[hIdx].profesionalId = newValue ? newValue.id : null;
                                setLocal(copia);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Profesional (nuevo)"
                                  placeholder={h?.especialidadId ? 'Elegir profesional' : 'Elegí una especialidad primero'}
                                  disabled={!(typeof h?.especialidadId === 'number')}
                                />
                              )}
                              noOptionsText="No hay profesionales asociados al centro"
                            />
                          ) : (
                            <TextField
                              size="small"
                              label="Profesional"
                              value={idToNombreProfesional.get(h.profesionalId) || '—'}
                              inputProps={{ readOnly: true }}
                            />
                          )}
                        </Box>
                      )}
                      {/* Botón eliminar al extremo derecho */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                        <IconButton color="error" onClick={() => eliminarHorario(hIdx)} aria-label="Eliminar horario" sx={{ ml: 'auto' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
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


