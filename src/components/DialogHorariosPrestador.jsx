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


const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DialogHorariosPrestador({ abierto, prestador, onCerrar, onGuardar, initialLugarIndex = 0, initialHorarioIndex = null, lockLugar = false }) {
  const [lugarIndex, setLugarIndex] = useState(0);
  const [selectedHorarioIndex, setSelectedHorarioIndex] = useState(null);
  const [local, setLocal] = useState(null);
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

  const idToNombreProfesional = useMemo(() => {
    const map = new Map();
    (profesionalesDelCentro || []).forEach(p => { if (p && typeof p.id === 'number' && p.nombreCompleto) map.set(p.id, p.nombreCompleto); });
    return map;
  }, [profesionalesDelCentro]);
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
      // Centro: cargar agendas del centro y mapearlas a los lugares definidos del centro
      try {
        const profList = await agendasService.getByCentro(prestador.id);
        const lugaresAgendas = [];
        const canonDir = (s) => {
          return String(s || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\b(s\/?n|s\/?d)\b/gi, '')
            .replace(/[,.;\-–—]+$/g, '')
            .trim()
            .toLowerCase();
        };
        const keyMap = new Map(); // key -> index en lugaresAgendas
        const add = (dir, h, pid, lugarId) => {
          const key = (typeof lugarId === 'number' && lugarId > 0) ? `id:${lugarId}` : `dir:${canonDir(dir)}`;
          let idx = keyMap.get(key);
          if (idx === undefined) {
            idx = lugaresAgendas.length;
            keyMap.set(key, idx);
            lugaresAgendas.push({ id: (typeof lugarId === 'number' && lugarId > 0 ? lugarId : null), direccion: dir, horarios: [] });
          }
          const lista = lugaresAgendas[idx].horarios;
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
        }

        // Partimos SIEMPRE de los lugares definidos en el centro (gestión de direcciones)
        const baseLugares = Array.isArray(prestador?.lugaresAtencion)
          ? JSON.parse(JSON.stringify(prestador.lugaresAtencion))
          : [];

        // Mergeamos horarios provenientes de Agenda por lugarId / dirección normalizada
        const canonMerge = (s) => String(s || '')
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/\b(s\/?n|s\/?d)\b/gi, '')
          .replace(/[,.;\-–—]+$/g, '')
          .trim()
          .toLowerCase();

        const byId = new Map(
          (Array.isArray(lugaresAgendas) ? lugaresAgendas : [])
            .filter(l => typeof l?.id === 'number')
            .map(l => [l.id, l])
        );
        const byDir = new Map(
          (Array.isArray(lugaresAgendas) ? lugaresAgendas : [])
            .map(l => [canonMerge(l.direccion), l])
        );

        const merged = baseLugares.map((l) => {
          const lid = (typeof l?.id === 'number') ? l.id : null;
          const match =
            (lid != null ? byId.get(lid) : null) ||
            byDir.get(canonMerge(l?.direccion));
          if (match) {
            return {
              ...l,
              horarios: Array.isArray(match.horarios) ? match.horarios : []
            };
          }
          return {
            ...l,
            horarios: Array.isArray(l?.horarios) ? l.horarios : []
          };
        });

        const finalLugares = merged.length > 0 ? merged : baseLugares;
        setLocal({ ...prestador, lugaresAtencion: finalLugares });
        setLugarIndex((finalLugares.length > 0) ? 0 : 0);
      } catch {
        const baseLugares = Array.isArray(prestador?.lugaresAtencion)
          ? JSON.parse(JSON.stringify(prestador.lugaresAtencion))
          : [];
        setLocal({ ...prestador, lugaresAtencion: baseLugares });
      }
    }
    init();
  }, [abierto, prestador, initialLugarIndex, initialHorarioIndex]);

  // No preseleccionar especialidad; el usuario debe elegirla explícitamente

  if (!prestador || !local) return null;

  const handleSelectLugar = (idx) => {
    if (lockLugar) return;
    setLugarIndex(idx);
  };

  // (UI para agregar direcciones del centro removida a pedido; solo se usan direcciones existentes)

  // Para centro: se ven todos los horarios por dirección; el profesional solo se elige al crear uno nuevo

  const agregarHorario = () => {
    const copia = JSON.parse(JSON.stringify(local || {}));
    const lugares = Array.isArray(copia.lugaresAtencion) ? copia.lugaresAtencion : [];
    // Si no hay direcciones, no se puede agregar horario
    if (lugares.length === 0) {
      alert('Agregá una dirección primero para poder cargar horarios.');
      return;
    }
    // Asegurar índice válido
    const idx = Math.min(Math.max(0, Number(lugarIndex) || 0), lugares.length - 1);
    const l = lugares[idx];
    l.horarios = Array.isArray(l.horarios) ? l.horarios : [];
    l.horarios.push({
      dias: [],
      horaInicio: '',
      horaFin: '',
      duracionMinutos: 30,
      especialidadId: null,
      profesionalId: (prestador?.tipo === 'Centro Médico' ? null : (prestador?.id || null))
    });
    copia.lugaresAtencion = lugares;
    setLugarIndex(idx);
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
    // Reglas extra: el backend de Agenda requiere lugarId válido
    const sinId = lugares.some((l) => (Array.isArray(l?.horarios) && l.horarios.length > 0) && !(typeof l?.id === 'number'));
    if (sinId) {
      alert('Esta dirección no tiene identificador. Guardá primero el centro/profesional para que la dirección obtenga un ID y luego cargá los horarios.');
      return;
    }
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
      // Enviamos ambas vistas de la data:
      // - actualizacionesPorProfesional: para flujos que necesitan saber qué cambia por profesional
      // - lugaresAtencion: para flujos que solo esperan los lugares del centro con horarios ya armados
      onGuardar?.({
        id: prestador.id,
        isCentro: true,
        actualizacionesPorProfesional,
        lugaresAtencion: copia.lugaresAtencion || []
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
                
              </>
            )}
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Horarios</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={agregarHorario}
                  disabled={!Array.isArray(local?.lugaresAtencion) || local.lugaresAtencion.length === 0}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Agregar Horario
                </Button>
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
                        <Box sx={{ minWidth: 180 }}>
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


