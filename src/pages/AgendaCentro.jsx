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
  TextField,
  Autocomplete,
  Chip
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PageHeader from '../components/Ui/PageHeader.jsx';
import * as prestadoresService from '../services/prestadoresService';
import * as agendasService from '../services/agendasService';
import DialogHorariosPrestador from '../components/DialogHorariosPrestador.jsx';
import { cargarPrestadores, selectPrestadores } from '../store/prestadoresSlice';
import { cargarEspecialidades, selectEspecialidades } from '../store/especialidadesSlice';

function AgendaCentro() {
  const { centroId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const todosPrestadores = useSelector(selectPrestadores);
  const catalogoEspecialidades = useSelector(selectEspecialidades);

  const [centro, setCentro] = useState(null);
  const [profesionalId, setProfesionalId] = useState(null);
  const [agendaDirecciones, setAgendaDirecciones] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState(null);

  const profesionalesDelCentro = useMemo(() => {
    const cid = Number(centroId);
    const byLink = (todosPrestadores || []).filter(p =>
      (p?.tipo === 'Profesional Independiente' || p?.rol === 1) && p?.integraCentroMedicoId === cid
    );
    const ids = Array.isArray(centro?.profesionalesIds) ? new Set(centro.profesionalesIds) : new Set();
    const byIds = (todosPrestadores || []).filter(p =>
      (p?.tipo === 'Profesional Independiente' || p?.rol === 1) && ids.has(p.id)
    );
    const map = new Map();
    [...byLink, ...byIds].forEach(p => { if (p && p.id != null) map.set(p.id, p); });
    return Array.from(map.values());
  }, [todosPrestadores, centro, centroId]);

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

  useEffect(() => {
    async function cargarAgenda() {
      if (!profesionalId) {
        setAgendaDirecciones([]);
        return;
      }
      try {
        const dirs = await agendasService.getByProfesional(profesionalId);
        setAgendaDirecciones(Array.isArray(dirs) ? dirs : []);
      } catch {
        setAgendaDirecciones([]);
      }
    }
    cargarAgenda();
  }, [profesionalId]);

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
        </Stack>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Profesional</Typography>
          <Autocomplete
            size="small"
            options={profesionalesDelCentro}
            getOptionLabel={(o) => o?.nombreCompleto || ''}
            isOptionEqualToValue={(o, v) => o?.id === v?.id}
            value={profesionalesDelCentro.find(p => p.id === profesionalId) || null}
            onChange={(e, newValue) => {
              setProfesionalId(newValue ? newValue.id : null);
              setPrestadorSeleccionado(newValue || null);
            }}
            renderInput={(params) => <TextField {...params} label="Seleccionar profesional" placeholder="Buscar..." />}
            noOptionsText="No hay profesionales asociados al centro"
            sx={{ maxWidth: 420 }}
          />
        </Box>

        <Divider />

        {profesionalId && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Agenda de {profesionalesDelCentro.find(p => p.id === profesionalId)?.nombreCompleto || ''}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Gestionar horarios
            </Button>
          </Box>
        )}

        {profesionalId && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {(agendaDirecciones || []).map((l, idx) => (
              <Card key={idx} variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <LocationOnIcon color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{l.direccion || `Lugar #${idx + 1}`}</Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(Array.isArray(l.horarios) ? l.horarios : (Array.isArray(l.horariosAtencion) ? l.horariosAtencion : [])).map((h, i) => {
                      const dias = Array.isArray(h.dias) ? h.dias : (Array.isArray(h.diasDeLaSemana) ? h.diasDeLaSemana : []);
                      const inicio = h.horaInicio || h.desde || '';
                      const fin = h.horaFin || h.hasta || '';
                      const dur = (typeof h.duracionConsulta === 'number' ? h.duracionConsulta : h.duracionMinutos) || undefined;
                      const espId = (Array.isArray(h.especialidades) && h.especialidades.length > 0)
                        ? h.especialidades[0]
                        : ((typeof h.especialidadId === 'number' && h.especialidadId > 0) ? h.especialidadId : null);
                      const espNom = espId != null ? especialidadIdToNombre.get(espId) : null;
                      return (
                        <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                          <Chip label={(dias || []).map(canonDia).join(', ')} size="small" />
                          <Typography variant="body2">{inicio} - {fin}{dur ? ` • ${dur} min` : ''}</Typography>
                          {espNom && <Chip label={espNom} size="small" color="primary" variant="outlined" />}
                        </Stack>
                      );
                    })}
                    {(Array.isArray(l.horarios) ? l.horarios : (Array.isArray(l.horariosAtencion) ? l.horariosAtencion : [])).length === 0 && (
                      <Typography variant="body2" color="text.secondary">Sin horarios.</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {dialogOpen && prestadorSeleccionado && (
        <DialogHorariosPrestador
          abierto={dialogOpen}
          prestador={prestadorSeleccionado}
          initialLugarIndex={0}
          initialHorarioIndex={null}
          lockLugar={false}
          onCerrar={() => setDialogOpen(false)}
          onGuardar={async (profActualizado) => {
            try {
              const id = profActualizado?.id || profesionalId;
              const lugares = profActualizado?.lugaresAtencion || [];
              await agendasService.updateLugares(id, lugares, { isCentro: false, strategy: 'merge' });
              const dirs = await agendasService.getByProfesional(id);
              setAgendaDirecciones(Array.isArray(dirs) ? dirs : []);
              setDialogOpen(false);
            } catch {
              setDialogOpen(false);
            }
          }}
        />
      )}
    </>
  );
}

export default AgendaCentro;


