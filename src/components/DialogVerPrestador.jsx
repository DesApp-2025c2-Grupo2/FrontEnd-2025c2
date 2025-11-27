import React from 'react';
import { useSelector } from 'react-redux';
import { selectEspecialidades } from '../store/especialidadesSlice';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Grid,
  IconButton
} from '@mui/material';
import { Link as MuiLink } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  MedicalServices as MedicalServicesIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  ContactPhone as ContactPhoneIcon
} from '@mui/icons-material';
import { selectPrestadores } from '../store/prestadoresSlice';
import * as agendasService from '../services/agendasService';

export default function DialogVerPrestador({ abierto, prestador, onCerrar }) {
  if (!prestador) return null;

  const theme = useTheme();
  const todosPrestadores = useSelector(selectPrestadores);
  const integraId = prestador?.integraCentroMedicoId ?? prestador?.centroMedicoId ?? null;
  const centroDeLista = integraId != null
    ? (todosPrestadores || []).find(p => String(p.id) === String(integraId))
    : null;
  const centroNombre =
    prestador?.centroMedicoNombre ||
    prestador?.centroMedico ||
    centroDeLista?.nombreCompleto ||
    null;
  const centroDisplay = centroNombre ? centroNombre : '—';

  const getTipoColor = (tipo) => {
    // Centro = secundario (verde), Profesional = primario (azul)
    return tipo === 'Centro Médico' ? theme.palette.secondary.main : theme.palette.primary.main;
  };

  const catalogoEspecialidades = useSelector(selectEspecialidades);
  const especialidadIdToNombre = React.useMemo(() => {
    const map = new Map();
    (catalogoEspecialidades || []).forEach((e) => {
      if (e && typeof e.id === 'number') map.set(e.id, e.nombre);
    });
    (prestador.especialidades || []).forEach((e) => {
      if (e && typeof e.id === 'number' && !map.has(e.id)) map.set(e.id, e.nombre);
    });
    return map;
  }, [catalogoEspecialidades, prestador.especialidades]);

  // Para centros, intentamos enriquecer los lugares con horarios desde /Agenda
  const [lugaresConHorarios, setLugaresConHorarios] = React.useState(null);

  React.useEffect(() => {
    let cancelado = false;
    async function cargarLugares() {
      if (!prestador || !prestador.id) {
        setLugaresConHorarios(null);
        return;
      }

      // PROFESIONAL INDEPENDIENTE: enriquecer con horarios desde /Agenda/getByProfesional
      if (prestador.tipo !== 'Centro Médico') {
        try {
          const res = await agendasService.getByProfesional(prestador.id);
          const listaAgendas = Array.isArray(res) ? res : [];
          const baseDirecciones = Array.isArray(prestador.lugaresAtencion) ? prestador.lugaresAtencion : [];

          let finales = baseDirecciones;
          if (listaAgendas.length > 0 && baseDirecciones.length > 0) {
            const canonMerge = (s) => String(s || '')
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, ' ')
              .replace(/\b(s\/?n|s\/?d)\b/gi, '')
              .replace(/[,.;\-–—]+$/g, '')
              .trim()
              .toLowerCase();

            const byId = new Map(
              listaAgendas
                .filter(l => typeof l?.id === 'number')
                .map(l => [l.id, l])
            );
            const byDir = new Map(
              listaAgendas.map(l => [canonMerge(l.direccion), l])
            );

            finales = baseDirecciones.map((l) => {
              const lid = (typeof l?.id === 'number') ? l.id : null;
              const match =
                (lid != null ? byId.get(lid) : null) ||
                byDir.get(canonMerge(l?.direccion));
              if (match) {
                const horarios = Array.isArray(match.horarios)
                  ? match.horarios
                  : (Array.isArray(match.horariosAtencion) ? match.horariosAtencion : []);
                return { ...l, horarios };
              }
              return {
                ...l,
                horarios: Array.isArray(l?.horarios) ? l.horarios : []
              };
            });
          } else if (listaAgendas.length > 0) {
            finales = listaAgendas.map(a => ({
              id: a?.id ?? null,
              direccion: a?.direccion || '',
              horarios: a?.horarios || a?.horariosAtencion || []
            }));
          }

          if (!cancelado) {
            setLugaresConHorarios(finales);
          }
          return;
        } catch {
          const baseDirecciones = Array.isArray(prestador.lugaresAtencion) ? prestador.lugaresAtencion : [];
          if (!cancelado) setLugaresConHorarios(baseDirecciones);
          return;
        }
      }

      // CENTROS MÉDICOS: enriquecer lugares del centro con horarios de /Agenda/getByCentro
      try {
        let arr = await agendasService.getByCentro(prestador.id);
        // Fallback: si el backend no devuelve agendas del centro, construirlas desde las agendas de los profesionales asociados
        if (!Array.isArray(arr) || arr.length === 0) {
          const ids = new Set(
            (Array.isArray(prestador?.profesionalesIds) ? prestador.profesionalesIds : [])
              .filter((x) => typeof x === 'number')
          );
          (todosPrestadores || []).forEach((p) => {
            if ((p?.tipo === 'Profesional Independiente' || p?.rol === 1) && p?.integraCentroMedicoId === prestador.id) {
              ids.add(p.id);
            }
          });
          if (ids.size > 0) {
            const reqs = [...ids].map((pid) =>
              agendasService.getByProfesional(pid)
                .then((dirs) => ({
                  profesionalId: pid,
                  nombreCompleto:
                    (todosPrestadores || []).find(pp => pp.id === pid)?.nombreCompleto || `Profesional ${pid}`,
                  direcciones: Array.isArray(dirs) ? dirs : []
                }))
                .catch(() => ({
                  profesionalId: pid,
                  nombreCompleto:
                    (todosPrestadores || []).find(pp => pp.id === pid)?.nombreCompleto || `Profesional ${pid}`,
                  direcciones: []
                }))
            );
            arr = await Promise.all(reqs);
          }
        }

        const canonDir = (s) => String(s || '')
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/\b(s\/?n|s\/?d)\b/gi, '')
          .replace(/[,.;\-–—]+$/g, '')
          .trim()
          .toLowerCase();

        const lugaresAgregados = [];
        const keyMap = new Map();

        const addHorario = (lugarId, dir, horario) => {
          const key = (typeof lugarId === 'number' && lugarId > 0) ? `id:${lugarId}` : `dir:${canonDir(dir)}`;
          let idx = keyMap.get(key);
          if (idx === undefined) {
            idx = lugaresAgregados.length;
            keyMap.set(key, idx);
            lugaresAgregados.push({ id: (typeof lugarId === 'number' && lugarId > 0) ? lugarId : null, direccion: dir, horarios: [] });
          }
          const lista = lugaresAgregados[idx].horarios;
          lista.push(horario);
        };

        (Array.isArray(arr) ? arr : []).forEach((p) => {
          const dirs = Array.isArray(p?.direcciones) ? p.direcciones : [];
          dirs.forEach((l) => {
            const dir = String(l?.direccion || '').trim();
            const lid = (typeof l?.id === 'number') ? l.id : (typeof l?.lugarId === 'number' ? l.lugarId : null);
            const horariosSrc = Array.isArray(l?.horarios)
              ? l.horarios
              : (Array.isArray(l?.horariosAtencion) ? l.horariosAtencion : []);
            horariosSrc.forEach((h) => addHorario(lid, dir, h));
          });
        });

        const baseDirecciones = Array.isArray(prestador.lugaresAtencion) ? prestador.lugaresAtencion : [];

        let finales = baseDirecciones;
        if (lugaresAgregados.length > 0 && baseDirecciones.length > 0) {
          // Merge: usar direcciones definidas en el centro y enriquecerlas con horarios de Agenda
          const canonMerge = (s) => String(s || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\b(s\/?n|s\/?d)\b/gi, '')
            .replace(/[,.;\-–—]+$/g, '')
            .trim()
            .toLowerCase();

          const byId = new Map(
            lugaresAgregados
              .filter(l => typeof l?.id === 'number')
              .map(l => [l.id, l])
          );
          const byDir = new Map(
            lugaresAgregados.map(l => [canonMerge(l.direccion), l])
          );

          const usados = new Set();
          finales = baseDirecciones.map((l) => {
            const lid = (typeof l?.id === 'number') ? l.id : null;
            const match =
              (lid != null ? byId.get(lid) : null) ||
              byDir.get(canonMerge(l?.direccion));
            if (match) {
              usados.add(match);
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

          // Agregar lugares extra que solo existen en Agenda (por si hubiera)
          lugaresAgregados.forEach((l) => {
            if (!usados.has(l)) {
              finales.push(l);
            }
          });
        } else if (lugaresAgregados.length > 0) {
          finales = lugaresAgregados;
        }

        if (!cancelado) setLugaresConHorarios(finales);
      } catch {
        if (!cancelado) {
          const baseDirecciones = Array.isArray(prestador.lugaresAtencion) ? prestador.lugaresAtencion : [];
          setLugaresConHorarios(baseDirecciones);
        }
      }
    }
    cargarLugares();
    return () => { cancelado = true; };
  }, [prestador, todosPrestadores]);

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: { borderRadius: 2, height: '90vh' }
      }}
    >
      <DialogTitle sx={{ px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Detalles del Prestador
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Información General */}
          <Stack direction="row" spacing={1} alignItems="center">
            <InfoIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Información General</Typography>
          </Stack>
          <Card
            variant="outlined"
            sx={{
              backgroundColor: 'background.paper',
              borderColor: 'divider'
            }}
          >
            <CardContent>
              <Grid container spacing={3}>
                {/* Cabecera en 4 columnas: Nombre, CUIL/CUIT, Tipo, Centro Médico */}
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    NOMBRE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {prestador.nombreCompleto}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    CUIL/CUIT
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {prestador.cuilCuit || prestador.documentacion?.numero || '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    TIPO DE PRESTADOR
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {prestador.tipo}
                  </Typography>
                </Grid>

                {/* Centro Médico */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      CENTRO MÉDICO
                    </Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {centroDisplay}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Especialidades */}
          {Array.isArray(prestador.especialidades) && prestador.especialidades.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <MedicalServicesIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Especialidades
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {prestador.especialidades.map((esp, idx) => {
                  const label = typeof esp === 'number' ? (especialidadIdToNombre.get(esp) || `#${esp}`) : (esp?.nombre || String(esp));
                  return (
                  <Chip
                    key={idx}
                    label={label}
                    sx={{
                      border: `1px solid ${theme.palette.primary.main}`,
                      color: 'primary.main',
                      backgroundColor: 'transparent',
                      borderRadius: 9999,
                      px: 1.5,
                      fontWeight: 600
                    }}
                  />
                )})}
              </Box>
            </Box>
          )}

          <Divider />

          {/* Contacto */}
          {(prestador.telefonos?.length || prestador.emails?.length) ? (
            <>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <ContactPhoneIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Información de Contacto
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                {prestador.telefonos && prestador.telefonos.length > 0 && (
                  <Grid item xs={12} sm={6} md={6}>
                    <Card variant="outlined" sx={{ backgroundColor: 'background.paper', borderColor: 'divider' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <PhoneIcon color="primary" fontSize="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Teléfonos</Typography>
                        </Stack>
                        <Box>
                          {prestador.telefonos.map((tel, idx) => (
                            <Typography key={idx} variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                              <MuiLink
                                href={`tel:${String(tel.numero || '').replace(/\s+/g, '')}`}
                                sx={{ color: 'text.primary', textDecoration: 'none' }}
                              >
                                {tel.numero}
                              </MuiLink>
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {prestador.emails && prestador.emails.length > 0 && (
                  <Grid item xs={12} sm={6} md={6}>
                    <Card variant="outlined" sx={{ backgroundColor: 'background.paper', borderColor: 'divider' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <EmailIcon color="primary" fontSize="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Emails</Typography>
                        </Stack>
                        <Box>
                          {prestador.emails.map((email, idx) => (
                            <Typography key={idx} variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                              <MuiLink
                                href={`mailto:${String(email?.email || email?.correo || '')}`}
                                sx={{ color: 'text.primary', textDecoration: 'none' }}
                              >
                                {email?.email || email?.correo || ''}
                              </MuiLink>
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </>
          ) : null}

          {/* Lugares de Atención */}
          {(() => {
            const lugares = Array.isArray(lugaresConHorarios)
              ? lugaresConHorarios
              : (Array.isArray(prestador.lugaresAtencion) ? prestador.lugaresAtencion : []);
            return Array.isArray(lugares) && lugares.length > 0;
          })() && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <LocationOnIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Lugares de Atención
                </Typography>
              </Stack>

              {(Array.isArray(lugaresConHorarios)
                ? lugaresConHorarios
                : (Array.isArray(prestador.lugaresAtencion) ? prestador.lugaresAtencion : [])
              ).map((lugar, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    {/* Dirección */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        {lugar.direccion}
                      </Typography>
                    </Box>

                    {/* Horarios (acepta lugar.horarios o lugar.horariosAtencion) */}
                    {(() => {
                      const horarios = Array.isArray(lugar.horarios)
                        ? lugar.horarios
                        : (Array.isArray(lugar.horariosAtencion) ? lugar.horariosAtencion : []);
                      return Array.isArray(horarios) && horarios.length > 0;
                    })() && (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                          <ScheduleIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Horarios de Atención
                          </Typography>
                        </Stack>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {(Array.isArray(lugar.horarios) ? lugar.horarios : (Array.isArray(lugar.horariosAtencion) ? lugar.horariosAtencion : [])).map((horario, hIdx) => {
                            const parseDias = (d) => {
                              if (Array.isArray(d)) return d;
                              if (typeof d === 'string') return d.split(/[,/]/).map(s => s.trim()).filter(Boolean);
                              return [];
                            };
                            const canon = (d) => {
                              const t = String(d || '').trim().toLowerCase();
                              if (!t) return '';
                              if (t === 'miercoles') return 'Miércoles';
                              if (t === 'sabado') return 'Sábado';
                              const map = { lunes: 'Lunes', martes: 'Martes', miércoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sábado: 'Sábado', domingo: 'Domingo' };
                              return map[t] || (t.charAt(0).toUpperCase() + t.slice(1));
                            };
                            const diasLinea = parseDias(horario.dias || horario.diasDeLaSemana).map(canon).filter(Boolean).join(', ');
                            const inicio = horario.horaInicio || horario.desde || horario.inicio || '';
                            const fin = horario.horaFin || horario.hasta || horario.fin || '';
                            const rango = [inicio, fin].filter(Boolean).join(' - ');
                            const duracion = typeof horario.duracionMinutos === 'number' && horario.duracionMinutos > 0
                              ? horario.duracionMinutos
                              : (typeof horario.duracionConsulta === 'number' && horario.duracionConsulta > 0 ? horario.duracionConsulta : null);
                            const dur = duracion ? ` • ${duracion} min` : '';
                            const nombre =
                              (typeof horario.especialidadId === 'number' && horario.especialidadId > 0
                                ? (especialidadIdToNombre.get(horario.especialidadId) || null)
                                : (typeof horario.especialidad === 'string' ? horario.especialidad : null));
                            const lineaDetalle = nombre ? `${nombre} • ${rango}${dur}` : `${rango}${dur}`;

                            // Ocultar filas totalmente vacías
                            if (!diasLinea && !rango) return null;

                            return (
                              <Box
                                key={hIdx}
                                sx={{
                                  p: 1.5,
                                  backgroundColor: theme.palette.action.selected,
                                  borderRadius: 1,
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                  {diasLinea}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                  {lineaDetalle}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onCerrar}
          variant="contained"
          color="primary"
          sx={{ fontWeight: 700, textTransform: 'none' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

