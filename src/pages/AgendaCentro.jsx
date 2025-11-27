import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  IconButton
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PageHeader from '../components/Ui/PageHeader.jsx';
import * as prestadoresService from '../services/prestadoresService';
import * as agendasService from '../services/agendasService';
import DialogHorariosPrestador from '../components/DialogHorariosPrestador.jsx';
import DialogVerPrestador from '../components/DialogVerPrestador.jsx';
import { cargarPrestadores, selectPrestadores } from '../store/prestadoresSlice';
import { cargarEspecialidades, selectEspecialidades } from '../store/especialidadesSlice';

function AgendaCentro() {
  const { centroId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const todosPrestadores = useSelector(selectPrestadores);
  const catalogoEspecialidades = useSelector(selectEspecialidades);

  const [centro, setCentro] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agendasCentro, setAgendasCentro] = useState([]);
  const [dialogVerProfesional, setDialogVerProfesional] = useState(false);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);

  const profesionalesDelCentro = useMemo(() => {
    const cid = Number(centroId);
    const byLink = (todosPrestadores || []).filter(p =>
      (p?.tipo === 'Profesional Independiente' || p?.rol === 1) && p?.integraCentroMedicoId === cid
    );
    const ids = Array.isArray(centro?.profesionalesIds) ? new Set(centro.profesionalesIds) : new Set();
    const byIds = (todosPrestadores || []).filter(p =>
      (p?.tipo === 'Profesional Independiente' || p?.rol === 1) && ids.has(p.id)
    );
    // Incluir profesionales que vienen del endpoint getByCentro (aunque no estén en store)
    const fromAgendas = (agendasCentro || []).map(p => ({
      id: Number(p?.profesionalId),
      nombreCompleto: p?.nombreCompleto || ''
    })).filter(x => x.id);
    const map = new Map();
    [...byLink, ...byIds, ...fromAgendas].forEach(p => { if (p && p.id != null) map.set(p.id, p); });
    return Array.from(map.values());
  }, [todosPrestadores, centro, centroId, agendasCentro]);

  useEffect(() => {
    dispatch(cargarPrestadores());
    dispatch(cargarEspecialidades());
  }, [dispatch]);

  useEffect(() => {
    async function cargarCentro() {
      try {
        const c = await prestadoresService.getById(Number(centroId));
        setCentro(c);
      } catch {
        setCentro(null);
      }
    }
    if (centroId) cargarCentro();
  }, [centroId]);

  // Cargar agendas del centro para poblar profesionales y fallback de direcciones
  useEffect(() => {
    let cancelado = false;
    async function cargarAgendasCentro() {
      if (!centroId) {
        setAgendasCentro([]);
        return;
      }
      try {
        const data = await agendasService.getByCentro(Number(centroId));
        if (!cancelado) setAgendasCentro(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelado) setAgendasCentro([]);
      }
    }
    cargarAgendasCentro();
    return () => { cancelado = true; };
  }, [centroId]);

  useEffect(() => {
    async function cargarAgenda() {
      if (!profesionalId) {
        setAgendaDirecciones([]);
        return;
      }
      try {
        const dirs = await agendasService.getByProfesional(profesionalId);
        const normal = Array.isArray(dirs) ? dirs : [];
        if (normal.length > 0) {
          setAgendaDirecciones(normal);
        } else {
          const pid = Number(profesionalId);
          const match = (agendasCentro || []).find(p => Number(p?.profesionalId) === pid);
          setAgendaDirecciones(Array.isArray(match?.direcciones) ? match.direcciones : []);
        }
      } catch {
        const pid = Number(profesionalId);
        const match = (agendasCentro || []).find(p => Number(p?.profesionalId) === pid);
        setAgendaDirecciones(Array.isArray(match?.direcciones) ? match.direcciones : []);
      }
    }
    cargarAgenda();
  }, [profesionalId, agendasCentro]);

  // Sólo agendas del centro: no cargamos agendas propias del profesional

  const especialidadIdToNombre = useMemo(() => {
    const map = new Map();
    (catalogoEspecialidades || []).forEach(e => {
      if (e && typeof e.id === 'number') map.set(e.id, e.nombre);
    });
    return map;
  }, [catalogoEspecialidades]);

  const canonDia = (d) => {
    const t = String(d || '').trim().toLowerCase();
    if (!t) return '';
    if (t === 'miercoles') return 'Miércoles';
    if (t === 'sabado') return 'Sábado';
    const map = { lunes: 'Lunes', martes: 'Martes', miércoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sábado: 'Sábado', domingo: 'Domingo' };
    return map[t] || (t.charAt(0).toUpperCase() + t.slice(1));
  };

  const canonDir = (s) => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(s\/?n|s\/?d)\b/gi, '')
    .replace(/[,.;\-–—]+$/g, '')
    .trim()
    .toLowerCase();

  // Mapa de profesionalId -> nombre (desde agendasCentro y store)
  const nombreProfesionalPorId = useMemo(() => {
    const map = new Map();
    (Array.isArray(agendasCentro) ? agendasCentro : []).forEach((p) => {
      const pid = Number(p?.profesionalId);
      if (pid) map.set(pid, p?.nombreCompleto || '');
    });
    (Array.isArray(profesionalesDelCentro) ? profesionalesDelCentro : []).forEach((p) => {
      if (p && p.id != null && !map.has(p.id)) map.set(p.id, p?.nombreCompleto || '');
    });
    return map;
  }, [agendasCentro, profesionalesDelCentro]);

  const handleVerProfesional = (profesionalId) => {
    if (typeof profesionalId !== 'number') return;
    const lista = Array.isArray(todosPrestadores) ? todosPrestadores : [];
    const prof = lista.find(p => p.id === profesionalId);
    if (!prof) return;
    setProfesionalSeleccionado(prof);
    setDialogVerProfesional(true);
  };

  // Lugares del centro con horarios (agregados desde todas las agendas por profesional)
  const lugaresCentro = useMemo(() => {
    const lugares = [];
    const keyMap = new Map();
    (Array.isArray(agendasCentro) ? agendasCentro : []).forEach((p) => {
      const pid = Number(p?.profesionalId) || null;
      const dirs = Array.isArray(p?.direcciones) ? p.direcciones : [];
      dirs.forEach((d) => {
        const lid = (typeof d?.id === 'number') ? d.id : (typeof d?.lugarId === 'number' ? d.lugarId : null);
        const dd = d?.detalleDireccion;
        const composed = (() => {
          const calleAltura = [dd?.calle, dd?.altura].filter(Boolean).join(' ').trim();
          return [calleAltura, dd?.provinciaCiudad].filter(Boolean).join(', ').trim();
        })();
        const dir = d?.direccion || composed || '';
        const key = (typeof lid === 'number' && lid > 0) ? `id:${lid}` : `dir:${canonDir(dir)}`;
        let idx = keyMap.get(key);
        if (idx === undefined) {
          idx = lugares.length;
          keyMap.set(key, idx);
          lugares.push({ id: (typeof lid === 'number' && lid > 0) ? lid : null, direccion: dir, detalleDireccion: dd || null, horarios: [] });
        }
        const horarios = Array.isArray(d?.horarios) ? d.horarios : (Array.isArray(d?.horariosAtencion) ? d.horariosAtencion : []);
        horarios.forEach((h) => {
          const profesionalIdHorario = (typeof h?.profesionalId === 'number') ? h.profesionalId : pid;
          lugares[idx].horarios.push({ ...h, profesionalId: profesionalIdHorario, lugarId: lid });
        });
      });
    });
    return lugares;
  }, [agendasCentro]);

  const eliminarHorarioCentro = async (h) => {
    try {
      const pid = (typeof h?.profesionalId === 'number') ? h.profesionalId : (typeof h?.prestadorId === 'number' ? h.prestadorId : null);
      const lid = (typeof h?.lugarId === 'number') ? h.lugarId : null;
      const hid = (typeof h?.id === 'number') ? h.id : null;
      if (pid == null || lid == null || lid <= 0 || hid == null) {
        alert('No se puede eliminar: falta información del lugar u horario.');
        return;
      }
      await agendasService.deleteHorario(pid, lid, hid);
      // Refrescar agendas del centro
      const data = await agendasService.getByCentro(Number(centroId));
      setAgendasCentro(Array.isArray(data) ? data : []);
    } catch (_) {
      alert('No se pudo eliminar el horario.');
    }
  };

  return (
    <>
      <PageHeader
        title="Agenda del Centro"
        subtitle="Gestioná la agenda de los profesionales del centro"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" onClick={() => navigate(-1)}>Volver</Button>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {centro?.nombreCompleto || 'Centro'}
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Gestionar horarios
            </Button>
          </Box>
        </Stack>

        {/* Lugares y horarios del Centro (sólo agendas del centro) */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Lugares de Atención del Centro
          </Typography>
          {Array.isArray(lugaresCentro) && lugaresCentro.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {lugaresCentro.map((l, idx) => (
                <Card key={idx} variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <LocationOnIcon color="action" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {l.direccion || `Lugar #${idx + 1}`}
                      </Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {(Array.isArray(l.horarios) ? l.horarios.filter((h) => typeof (h?.profesionalId ?? h?.prestadorId) === 'number') : []).map((h, i) => {
                        const dias = Array.isArray(h.dias) ? h.dias : (Array.isArray(h.diasDeLaSemana) ? h.diasDeLaSemana : []);
                        const inicio = h.horaInicio || h.desde || '';
                        const fin = h.horaFin || h.hasta || '';
                        const dur = (typeof h.duracionConsulta === 'number' ? h.duracionConsulta : h.duracionMinutos) || undefined;
                        const espId = (Array.isArray(h.especialidades) && h.especialidades.length > 0)
                          ? h.especialidades[0]
                          : ((typeof h.especialidadId === 'number' && h.especialidadId > 0) ? h.especialidadId : null);
                        const espNom = espId != null ? especialidadIdToNombre.get(espId) : null;
                        const profId = (typeof h?.profesionalId === 'number') ? h.profesionalId : null;
                        const profNom = profId != null ? (nombreProfesionalPorId.get(profId) || '') : '';
                        return (
                          <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                            <Chip label={(dias || []).map(canonDia).join(', ')} size="small" />
                            <Typography variant="body2">{inicio} - {fin}{dur ? ` • ${dur} min` : ''}</Typography>
                            {espNom && <Chip label={espNom} size="small" color="primary" variant="outlined" />}
                            {profNom && (
                              <Chip
                                label={profNom}
                                size="small"
                                icon={<PersonIcon />}
                                clickable
                                onClick={() => handleVerProfesional(profId)}
                              />
                            )}
                          <IconButton color="error" onClick={() => eliminarHorarioCentro(h)} aria-label="Eliminar horario" sx={{ ml: 'auto' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          </Stack>
                        );
                      })}
                      {(Array.isArray(l.horarios) ? l.horarios.filter((h) => typeof (h?.profesionalId ?? h?.prestadorId) === 'number') : []).length === 0 && (
                        <Typography variant="body2" color="text.secondary">Sin horarios.</Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">Sin lugares u horarios del centro.</Typography>
          )}
        </Box>

      </Box>

      {dialogOpen && centro && (
        <DialogHorariosPrestador
          abierto={dialogOpen}
          prestador={centro}
          initialLugarIndex={0}
          initialHorarioIndex={null}
          lockLugar={false}
          onCerrar={() => setDialogOpen(false)}
          onGuardar={async (profActualizado) => {
            try {
              // Guardar como CENTRO: centroId en URL, profesionalId en cada horario
              const lugares = profActualizado?.lugaresAtencion || [];
              await agendasService.updateLugares(Number(centroId), lugares, { isCentro: true, strategy: 'merge' });
              // Refrescar agendas del centro para que "Lugares de Atención del Centro" muestre lo nuevo
              try {
                const data = await agendasService.getByCentro(Number(centroId));
                setAgendasCentro(Array.isArray(data) ? data : []);
              } catch {
                // si falla el refresh, al menos cerramos el diálogo
              }
              setDialogOpen(false);
            } catch {
              setDialogOpen(false);
            }
          }}
        />
      )}

      {dialogVerProfesional && profesionalSeleccionado && (
        <DialogVerPrestador
          abierto={dialogVerProfesional}
          prestador={profesionalSeleccionado}
          onCerrar={() => {
            setDialogVerProfesional(false);
            setProfesionalSeleccionado(null);
          }}
        />
      )}
    </>
  );
}

export default AgendaCentro;


