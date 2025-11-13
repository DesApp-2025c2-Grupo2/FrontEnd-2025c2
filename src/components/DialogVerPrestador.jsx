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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Detalles del Prestador
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
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
          {prestador.lugaresAtencion && prestador.lugaresAtencion.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <LocationOnIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Lugares de Atención
                </Typography>
              </Stack>

              {prestador.lugaresAtencion.map((lugar, index) => (
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

