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
  Card,
  CardContent,
  CircularProgress,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import { useSelector } from 'react-redux';
import { selectPrestadores } from '../store/prestadoresSlice';
import { selectEspecialidades } from '../store/especialidadesSlice';
import * as agendasService from '../services/agendasService';

export default function DialogVerCentroAgendas({ abierto, centro, onCerrar, onVerProfesional }) {
  const todosPrestadores = useSelector(selectPrestadores);
  const catalogoEspecialidades = useSelector(selectEspecialidades);

  const [cargando, setCargando] = useState(false);
  const [agregado, setAgregado] = useState([]); // [{ direccion, items: [{profesionalId, profNombre, dias, hi, hf, dur, espNombre}] }]

  const profesionalIdToNombre = useMemo(() => {
    const map = new Map();
    (todosPrestadores || []).forEach((p) => {
      if (p && typeof p.id === 'number' && p.nombreCompleto) map.set(p.id, p.nombreCompleto);
    });
    return map;
  }, [todosPrestadores]);

  const especialidadIdToNombre = useMemo(() => {
    const map = new Map();
    (catalogoEspecialidades || []).forEach((e) => {
      if (e && typeof e.id === 'number') map.set(e.id, e.nombre);
    });
    return map;
  }, [catalogoEspecialidades]);

  useEffect(() => {
    async function cargar() {
      if (!abierto || !centro) return;
      setCargando(true);
      try {
        // Preferir endpoint agregado del backend
        let arr = await agendasService.getByCentro(centro.id);
        if (!Array.isArray(arr) || arr.length === 0) {
          // Fallback: fan-out por profesional
          const ids = new Set(
            (Array.isArray(centro?.profesionalesIds) ? centro.profesionalesIds : [])
              .filter((x) => typeof x === 'number')
          );
          (todosPrestadores || []).forEach((p) => {
            if ((p?.tipo === 'Profesional Independiente' || p?.rol === 1) && p?.integraCentroMedicoId === centro.id) {
              ids.add(p.id);
            }
          });
          const reqs = [...ids].map((pid) =>
            agendasService.getByProfesional(pid).then((dirs) => ({ profesionalId: pid, nombreCompleto: profesionalIdToNombre.get(pid) || `Profesional ${pid}`, direcciones: Array.isArray(dirs) ? dirs : [] })).catch(() => ({ profesionalId: pid, nombreCompleto: profesionalIdToNombre.get(pid) || `Profesional ${pid}`, direcciones: [] }))
          );
          arr = await Promise.all(reqs);
        }
        // Agrupar por dirección
        const canonDir = (s) => {
          return String(s || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\b(s\/?n|s\/?d)\b/gi, '')
            .replace(/[,.;\-–—]+$/g, '')
            .trim()
            .toLowerCase();
        };
        const map = new Map(); // key -> {direccion, items: []}
        arr.forEach(({ profesionalId, nombreCompleto, direcciones }) => {
          const profNombre = nombreCompleto || profesionalIdToNombre.get(profesionalId) || `Profesional ${profesionalId}`;
          (direcciones || []).forEach((l) => {
            const dir = String(l?.direccion || '').trim();
            const key = (typeof l?.id === 'number' || typeof l?.lugarId === 'number') ? `id:${l?.id ?? l?.lugarId}` : `dir:${canonDir(dir)}`;
            const nodo = map.get(key) || { direccion: dir, items: [] };
            const horarios = Array.isArray(l?.horarios) ? l.horarios : (Array.isArray(l?.horariosAtencion) ? l.horariosAtencion : []);
            horarios.forEach((h) => {
              const dias = Array.isArray(h?.dias) ? h.dias : (Array.isArray(h?.diasDeLaSemana) ? h.diasDeLaSemana : []);
              const hi = h?.horaInicio || h?.desde || '';
              const hf = h?.horaFin || h?.hasta || '';
              const dur = (typeof h?.duracionConsulta === 'number' ? h.duracionConsulta : h?.duracionMinutos) || undefined;
              const espId = (Array.isArray(h?.especialidades) && h.especialidades.length > 0)
                ? h.especialidades[0]
                : ((typeof h?.especialidadId === 'number' && h.especialidadId > 0) ? h.especialidadId : null);
              const espNombre = (espId != null) ? (especialidadIdToNombre.get(espId) || `Esp. ${espId}`) : null;
              const dupKey = JSON.stringify({ d: [...(dias || [])].sort(), hi, hf, dur, esp: espId, p: profNombre });
              const exists = nodo.items.some(x => JSON.stringify({ d: [...(x.dias || [])].sort(), hi: x.hi, hf: x.hf, dur: x.dur, esp: (x._espId || null), p: x.profNombre }) === dupKey);
              if (!exists) nodo.items.push({ profesionalId, profNombre, dias, hi, hf, dur, espNombre, _espId: espId });
            });
            map.set(key, nodo);
          });
        });
        setAgregado(Array.from(map.values()));
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [abierto, centro, todosPrestadores, profesionalIdToNombre, especialidadIdToNombre]);

  const canonDia = (d) => {
    const t = String(d || '').trim().toLowerCase();
    if (!t) return '';
    if (t === 'miercoles') return 'Miércoles';
    if (t === 'sabado') return 'Sábado';
    const map = { lunes: 'Lunes', martes: 'Martes', miércoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sábado: 'Sábado', domingo: 'Domingo' };
    return map[t] || (t.charAt(0).toUpperCase() + t.slice(1));
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 2, height: '90vh' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Agendas del Centro
        </Typography>
        <Button onClick={onCerrar} startIcon={<CloseIcon />}>Cerrar</Button>
      </DialogTitle>
      <DialogContent dividers>
        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {agregado.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No hay horarios cargados.</Typography>
            ) : agregado.map((l, idx) => (
              <Card key={idx} variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <LocationOnIcon color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{l.direccion}</Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {l.items.map((it, i) => (
                      <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Chip
                          icon={<PersonIcon />}
                          label={it.profNombre}
                          size="small"
                          clickable={!!onVerProfesional && typeof it.profesionalId === 'number'}
                          onClick={onVerProfesional && typeof it.profesionalId === 'number'
                            ? () => onVerProfesional(it.profesionalId)
                            : undefined}
                        />
                        <Chip icon={<ScheduleIcon />} label={(it.dias || []).map(canonDia).join(', ')} size="small" variant="outlined" />
                        <Typography variant="body2">{it.hi} - {it.hf}{it.dur ? ` • ${it.dur} min` : ''}</Typography>
                        {it.espNombre && <Chip label={it.espNombre} size="small" color="primary" variant="outlined" />}
                      </Stack>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCerrar}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}


