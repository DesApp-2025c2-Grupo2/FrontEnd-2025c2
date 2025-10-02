import React from 'react';
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
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon
} from '@mui/icons-material';

export default function DialogVerAgenda({ abierto, agenda, onCerrar }) {
  if (!agenda) return null;

  // Función para obtener color según especialidad
  const getEspecialidadColor = (especialidad) => {
    const especialidadColors = {
      'Cardiología': '#2196f3',
      'Traumatología': '#9c27b0',
      'Clínico': '#2196f3',
      'Medicina General': '#4caf50'
    };
    return especialidadColors[especialidad] || '#2196f3';
  };

  // Función para obtener color de la duración
  const getDuracionColor = (duracion) => {
    if (duracion <= 30) return '#2196f3';
    if (duracion <= 45) return '#ff9800';
    return '#9c27b0';
  };

  // Función para calcular slots de turnos
  const calcularSlots = (horaInicio, horaFin, duracion) => {
    const [hI, mI] = horaInicio.split(':').map(Number);
    const [hF, mF] = horaFin.split(':').map(Number);
    
    const inicioMinutos = hI * 60 + mI;
    const finMinutos = hF * 60 + mF;
    const totalMinutos = finMinutos - inicioMinutos;
    
    const cantidadTurnos = Math.floor(totalMinutos / duracion);
    const slots = [];
    
    for (let i = 0; i < cantidadTurnos; i++) {
      const turnoInicio = inicioMinutos + (i * duracion);
      const turnoFin = turnoInicio + duracion;
      
      const hInicio = Math.floor(turnoInicio / 60);
      const mInicio = turnoInicio % 60;
      const hFin = Math.floor(turnoFin / 60);
      const mFin = turnoFin % 60;
      
      slots.push({
        numero: i + 1,
        horario: `${String(hInicio).padStart(2, '0')}:${String(mInicio).padStart(2, '0')} - ${String(hFin).padStart(2, '0')}:${String(mFin).padStart(2, '0')}`
      });
    }
    
    return slots;
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800, color: '#111827', pb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <ScheduleIcon color="primary" />
            <Typography variant="h6">Detalles de la Agenda de Turnos</Typography>
          </Stack>
          <Chip
            label={agenda.activo ? 'ACTIVA' : 'INACTIVA'}
            color={agenda.activo ? 'success' : 'default'}
            sx={{ fontWeight: 700 }}
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Información del Prestador */}
          <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <PersonIcon color="action" fontSize="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      PRESTADOR
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                    {agenda.prestador}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <MedicalServicesIcon color="action" fontSize="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {Array.isArray(agenda.especialidad) ? 'ESPECIALIDADES' : 'ESPECIALIDAD'}
                    </Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Array.isArray(agenda.especialidad) ? (
                      agenda.especialidad.map((esp, idx) => (
                        <Chip
                          key={idx}
                          label={esp}
                          sx={{
                            backgroundColor: getEspecialidadColor(esp),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}
                        />
                      ))
                    ) : (
                      <Chip
                        label={agenda.especialidad}
                        sx={{
                          backgroundColor: getEspecialidadColor(agenda.especialidad),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Resumen de Turnos */}
          <Card variant="outlined" sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#2196f3' }}>
                    {agenda.totalTurnos}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    TURNOS POR SEMANA
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#2196f3' }}>
                    {agenda.direcciones?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {agenda.direcciones?.length === 1 ? 'DIRECCIÓN' : 'DIRECCIONES'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Direcciones y Horarios */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
              Horarios por Dirección
            </Typography>

            {agenda.direcciones?.map((direccion, index) => (
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
                  <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
                    <LocationOnIcon sx={{ color: '#2196f3', fontSize: 24, mt: 0.3 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                        {direccion.lugar}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Información de turnos */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`${direccion.duracion} minutos por turno`}
                      sx={{
                        backgroundColor: getDuracionColor(direccion.duracion),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    <Chip
                      label={`${direccion.turnosPorSemana} turnos/semana`}
                      variant="outlined"
                      sx={{
                        borderColor: '#2196f3',
                        color: '#2196f3',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Horarios */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: '#111827', mb: 1.5 }}
                    >
                      Horarios de atención:
                    </Typography>

                    <Grid container spacing={1.5}>
                      {direccion.horarios?.map((horario, idx) => {
                        const [horaInicio, horaFin] = horario.horario.split('-');
                        const slots = calcularSlots(horaInicio, horaFin, direccion.duracion);
                        
                        return (
                          <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Card
                              variant="outlined"
                              sx={{
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6'
                              }}
                            >
                              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                <Chip
                                  label={horario.dia}
                                  size="small"
                                  sx={{
                                    backgroundColor: '#2196f3',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    mb: 1
                                  }}
                                />
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                                  <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {horario.horario}
                                  </Typography>
                                </Stack>
                                <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                                  {slots.length} turnos
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* Fecha de creación */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Creada: {direccion.fechaCreacion}
                      </Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onCerrar}
          variant="contained"
          color="primary"
          sx={{ fontWeight: 700, textTransform: 'none' }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

