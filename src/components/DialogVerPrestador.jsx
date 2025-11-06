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
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { selectPrestadores } from '../store/prestadoresSlice';

export default function DialogVerPrestador({ abierto, prestador, onCerrar }) {
  if (!prestador) return null;

  const todosPrestadores = useSelector(selectPrestadores);
  const centroNombre = prestador.integraCentroMedicoId
    ? (todosPrestadores || []).find(p => p.id === prestador.integraCentroMedicoId)?.nombreCompleto
    : null;

  const getTipoColor = (tipo) => {
    return tipo === 'Centro Médico' ? '#9c27b0' : '#2196f3';
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
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800, color: '#111827', pb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonIcon color="primary" />
          <Typography variant="h6">Detalles del Prestador</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Información Básica */}
          <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
                    {prestador.nombreCompleto}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={prestador.tipo}
                      sx={{
                        backgroundColor: getTipoColor(prestador.tipo),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      CUIL/CUIT
                    </Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {prestador.cuilCuit}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      TIPO DE PRESTADOR
                    </Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {prestador.tipo}
                  </Typography>
                </Grid>
                
                {/* Centro Médico - Solo si es profesional independiente y tiene valor */}
                {prestador.tipo === 'Profesional Independiente' && centroNombre && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <BusinessIcon color="action" fontSize="small" />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        INTEGRA CENTRO MÉDICO
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {centroNombre}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Especialidades */}
          {prestador.especialidades && prestador.especialidades.length > 0 && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <MedicalServicesIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Especialidades
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {prestador.especialidades.map((esp, idx) => (
                  <Chip
                    key={idx}
                    label={esp.nombre}
                    sx={{
                      backgroundColor: '#e3f2fd',
                      color: 'text.primary',
                      fontWeight: 600
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Información de Contacto */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Información de Contacto
            </Typography>
            <Grid container spacing={2}>
              {/* Teléfonos */}
              {prestador.telefonos && prestador.telefonos.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <PhoneIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Teléfonos
                        </Typography>
                      </Stack>
                      {prestador.telefonos.map((tel, idx) => (
                        <Box key={idx} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {tel.numero}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Emails */}
              {prestador.emails && prestador.emails.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <EmailIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Emails
                        </Typography>
                      </Stack>
                      {prestador.emails.map((email, idx) => (
                        <Box key={idx} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {email.email}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>

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
                    border: '2px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    {/* Dirección */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                        📍 {lugar.direccion}
                      </Typography>
                    </Box>

                    {/* Horarios */}
                    {lugar.horarios && lugar.horarios.length > 0 && (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                          <ScheduleIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Horarios de Atención
                          </Typography>
                        </Stack>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {lugar.horarios.map((horario, hIdx) => (
                            <Box
                              key={hIdx}
                              sx={{
                                p: 1.5,
                                backgroundColor: '#e3f2fd',
                                borderRadius: 1,
                                border: '1px solid #2196f3'
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                {(() => {
                                  const canon = (d) => {
                                    const t = String(d || '').trim().toLowerCase();
                                    if (!t) return '';
                                    if (t === 'miercoles') return 'Miércoles';
                                    if (t === 'sabado') return 'Sábado';
                                    const map = { lunes: 'Lunes', martes: 'Martes', miércoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sábado: 'Sábado', domingo: 'Domingo' };
                                    return map[t] || (t.charAt(0).toUpperCase() + t.slice(1));
                                  };
                                  return (horario.dias || []).map(canon).filter(Boolean).join(', ');
                                })()}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#1976d2' }}>
                                {(() => {
                                  const nombre = (typeof horario.especialidadId === 'number' && horario.especialidadId > 0)
                                    ? (especialidadIdToNombre.get(horario.especialidadId) || null)
                                    : null;
                                  return nombre ? `🩺 ${nombre} • ${horario.horaInicio} - ${horario.horaFin}` : `⏰ ${horario.horaInicio} - ${horario.horaFin}`;
                                })()}
                                {typeof horario.duracionMinutos === 'number' && horario.duracionMinutos > 0 ? ` • ${horario.duracionMinutos} min` : ''}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Resumen */}
          <Card variant="outlined" sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2196f3' }}>
                    {prestador.especialidades?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {prestador.especialidades?.length === 1 ? 'ESPECIALIDAD' : 'ESPECIALIDADES'}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2196f3' }}>
                    {prestador.lugaresAtencion?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {prestador.lugaresAtencion?.length === 1 ? 'LUGAR' : 'LUGARES'}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2196f3' }}>
                    {prestador.telefonos?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    TELÉFONOS
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
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

