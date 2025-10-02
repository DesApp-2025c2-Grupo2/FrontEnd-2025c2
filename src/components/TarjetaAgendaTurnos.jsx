import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  Collapse,
  Divider,
  Stack
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import BotonAlternarEstado from './BotonAlternarEstado';

const TarjetaAgendaTurnos = ({ agenda, onVer, onEditar, onToggleActivo }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

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

  // Función para obtener color del día de la semana
  const getDiaColor = (dia) => {
    return '#2196f3'; // Azul para todos los días
  };

  // Función para obtener color de la duración
  const getDuracionColor = (duracion) => {
    if (duracion <= 30) return '#2196f3'; // Azul
    if (duracion <= 45) return '#ff9800'; // Naranja
    return '#9c27b0'; // Morado
  };

  return (
    <Card
      elevation={1}
      sx={{
        mb: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={1} flex={1}>
            {/* Header con nombre e ícono */}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Box sx={{
                  backgroundColor: '#e3f2fd',
                  borderRadius: '50%',
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ScheduleIcon sx={{
                    color: '#2196f3',
                    fontSize: { xs: 20, sm: 24 }
                  }} />
                </Box>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {agenda.prestador}
                </Typography>
              </Stack>

              {/* Chips de especialidad y contadores */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {/* Manejar especialidad como string o array */}
                {Array.isArray(agenda.especialidad) ? (
                  agenda.especialidad.map((esp, idx) => (
                    <Chip
                      key={idx}
                      label={esp}
                      size="small"
                      sx={{
                        backgroundColor: getEspecialidadColor(esp),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        height: { xs: 24, sm: 28 }
                      }}
                    />
                  ))
                ) : (
                  <Chip
                    label={agenda.especialidad}
                    size="small"
                    sx={{
                      backgroundColor: getEspecialidadColor(agenda.especialidad),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      height: { xs: 24, sm: 28 }
                    }}
                  />
                )}
                <Chip 
                  label={agenda.activo ? 'Activo' : 'Inactivo'} 
                  size="small" 
                  color={agenda.activo ? 'success' : 'default'} 
                  sx={{ borderRadius: 999, height: { xs: 24, sm: 28 } }}
                />
                <Chip
                  label={`${agenda.totalTurnos} turnos/sem total`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: '#e0e0e0',
                    color: 'text.secondary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 24, sm: 28 }
                  }}
                />
                <Chip
                  label={`${agenda.direcciones.length} ${agenda.direcciones.length === 1 ? 'dirección' : 'direcciones'}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: '#e0e0e0',
                    color: 'text.secondary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 24, sm: 28 }
                  }}
                />
              </Box>
            </Stack>

          <Stack spacing={0.5} alignItems="flex-end" sx={{ minWidth: 170 }}>
            <Button
                type="button"
                variant="text"
                startIcon={<VisibilityIcon />}
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  onVer?.(agenda); 
                }}
                sx={{
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  width: 160,
                  height: 40,
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  border: '1px solid #2563eb',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#2563eb',
                    color: 'white'
                  }
                }}
              >
                Ver Detalles
              </Button>

              {/* Botón Editar */}
              <Button
                type="button"
                variant="text"
                startIcon={<EditIcon />}
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  onEditar?.(agenda); 
                }}
                sx={{
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  width: 160,
                  height: 40,
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  border: '1px solid #2563eb',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#2563eb',
                    color: 'white'
                  }
                }}
              >
                Editar
              </Button>

            <BotonAlternarEstado 
              activo={!!agenda.activo} 
              onClick={() => onToggleActivo?.(agenda)} 
            />
          </Stack>
        </Stack>

        {/* Sección expandible de Horarios por Dirección */}
        <Box sx={{ mt: 2 }}>
          <Button
            onClick={handleExpandClick}
            sx={{
              color: 'text.primary',
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              textTransform: 'none',
              p: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                opacity: 0.7
              }
            }}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            Horarios por Dirección
          </Button>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              {agenda.direcciones.map((direccion, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: index < agenda.direcciones.length - 1 ? 3 : 0,
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef'
                  }}
                >
                  {/* Dirección */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    mb: 2,
                    gap: 1
                  }}>
                    <LocationOnIcon sx={{
                      color: 'text.secondary',
                      fontSize: 20,
                      mt: 0.2
                    }} />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: 'text.primary'
                      }}
                    >
                      {direccion.lugar}
                    </Typography>
                  </Box>

                  {/* Duración y cantidad de turnos */}
                  <Box sx={{
                    display: 'flex',
                    gap: 1.5,
                    mb: 2,
                    flexWrap: 'wrap'
                  }}>
                    <Chip
                      label={`${direccion.duracion} min`}
                      size="small"
                      sx={{
                        backgroundColor: getDuracionColor(direccion.duracion),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        height: { xs: 24, sm: 28 }
                      }}
                    />
                    <Chip
                      label={`${direccion.turnosPorSemana} turnos/sem`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#e0e0e0',
                        color: 'text.secondary',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        height: { xs: 24, sm: 28 }
                      }}
                    />
                  </Box>

                  {/* Horarios por día */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                  }}>
                    {direccion.horarios.map((horario, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5
                        }}
                      >
                        <Chip
                          label={horario.dia}
                          size="small"
                          sx={{
                            backgroundColor: getDiaColor(horario.dia),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            height: { xs: 24, sm: 28 },
                            alignSelf: 'flex-start'
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            ml: 0.5
                          }}
                        >
                          {horario.horario}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Fecha de creación */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 2,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    Creada: {direccion.fechaCreacion}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TarjetaAgendaTurnos;

