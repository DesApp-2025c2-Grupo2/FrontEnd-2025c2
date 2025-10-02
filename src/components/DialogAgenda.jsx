import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Divider,
  Grid,
  Card,
  CardContent,
  FormHelperText,
  Alert,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { selectPrestadores } from '../store/prestadoresSlice';
import {
  validarAgendaCompleta,
  obtenerLugaresAtencion,
  obtenerDiasDisponibles,
  obtenerRangosHorarios
} from '../utilidades/validacionesAgendas';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Función para verificar si dos rangos horarios se solapan
const horariosSeSuperponen = (horario1, horario2) => {
  const h1Inicio = horario1.horaInicio;
  const h1Fin = horario1.horaFin;
  const h2Inicio = horario2.horaInicio;
  const h2Fin = horario2.horaFin;

  // Si alguno de los horarios está incompleto, no validar
  if (!h1Inicio || !h1Fin || !h2Inicio || !h2Fin) return false;

  // Verificar si hay solapamiento
  return (
    (h1Inicio < h2Fin && h1Fin > h2Inicio) || // h1 solapa con h2
    (h2Inicio < h1Fin && h2Fin > h1Inicio)    // h2 solapa con h1
  );
};

// Función para detectar conflictos de horarios en una dirección
const detectarConflictosHorarios = (horarios) => {
  const conflictos = [];

  for (let i = 0; i < horarios.length; i++) {
    const horario1 = horarios[i];
    if (!horario1.dia) continue;

    for (let j = i + 1; j < horarios.length; j++) {
      const horario2 = horarios[j];
      if (!horario2.dia) continue;

      // Verificar si es el mismo día
      if (horario1.dia === horario2.dia) {
        // Si es el mismo día, verificar si los horarios se solapan
        if (horariosSeSuperponen(horario1, horario2)) {
          conflictos.push({
            indice1: i,
            indice2: j,
            dia: horario1.dia,
            horario1: `${horario1.horaInicio}-${horario1.horaFin}`,
            horario2: `${horario2.horaInicio}-${horario2.horaFin}`
          });
        }
      }
    }
  }

  return conflictos;
};

export default function DialogAgenda({ abierto, valorInicial, onCerrar, onGuardar }) {
  const [form, setForm] = useState({
    prestadorId: null,
    prestador: '',
    especialidad: '',
    direcciones: []
  });

  const [validacionCoherencia, setValidacionCoherencia] = useState({ valida: true, errores: [] });
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState(null);
  const [conflictosHorarios, setConflictosHorarios] = useState({});
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  // Cargar prestadores desde Redux (todos, no solo activos)
  const todosPrestadores = useSelector(selectPrestadores);
  // Filtrar solo prestadores activos
  const prestadores = todosPrestadores.filter(p => p.activo);

  // Inicializar formulario (no depender de cambios en prestadores para no resetear la selección)
  useEffect(() => {
    if (!abierto) return;
    if (valorInicial) {
      // Modo edición
      setForm({
        prestadorId: valorInicial.prestadorId ?? null,
        prestador: valorInicial.prestador || '',
        especialidad: valorInicial.especialidad || '',
        direcciones: valorInicial.direcciones || [],
        id: valorInicial.id
      });
    } else {
      // Modo creación - resetear formulario
      setForm({
        prestadorId: null,
        prestador: '',
        especialidad: '',
        direcciones: []
      });
      setPrestadorSeleccionado(null);
    }
    setValidacionCoherencia({ valida: true, errores: [] });
    setConflictosHorarios({});
    setIntentoGuardar(false);
  }, [abierto, valorInicial]);

  // Sincronizar prestadorSeleccionado cuando los prestadores terminen de cargar
  useEffect(() => {
    if (!abierto) return;
    if (form.prestadorId) {
      const prestador = prestadores.find(p => p.id === form.prestadorId) || null;
      setPrestadorSeleccionado(prestador);
    }
  }, [abierto, prestadores, form.prestadorId]);

  // Validar coherencia cuando cambie prestador o datos de la agenda
  useEffect(() => {
    if (prestadorSeleccionado && form.especialidad && form.direcciones.length > 0) {
      // Adaptar estructura de horarios para la validación (requiere campo "horario")
      const agendaParaValidar = {
        ...form,
        direcciones: form.direcciones.map((dir) => ({
          ...dir,
          horarios: (dir.horarios || [])
            .map((h) => ({
              dia: h.dia,
              horario: h.horario ? h.horario : (h.horaInicio && h.horaFin ? `${h.horaInicio}-${h.horaFin}` : null)
            }))
            .filter((h) => !!h.horario)
        }))
      };

      const resultado = validarAgendaCompleta(prestadorSeleccionado, agendaParaValidar);
      setValidacionCoherencia(resultado);
    } else {
      setValidacionCoherencia({ valida: true, errores: [] });
    }
  }, [prestadorSeleccionado, form.especialidad, form.direcciones]);

  // Detectar conflictos de horarios
  useEffect(() => {
    const nuevosConflictos = {};
    
    form.direcciones.forEach((direccion, index) => {
      const conflictos = detectarConflictosHorarios(direccion.horarios);
      if (conflictos.length > 0) {
        nuevosConflictos[index] = conflictos;
      }
    });

    setConflictosHorarios(nuevosConflictos);
  }, [form.direcciones]);

  const cambiar = (campo) => (e) => {
    const valor = e.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
    
    // Si cambia el prestador, actualizar prestadorSeleccionado
    if (campo === 'prestadorId') {
      const prestador = prestadores.find(p => p.id === valor);
      setPrestadorSeleccionado(prestador);
      // Resetear especialidad y direcciones si cambia el prestador
      setForm(prev => ({
        ...prev,
        prestadorId: valor,
        prestador: prestador?.nombreCompleto || '',
        especialidad: '',
        direcciones: []
      }));
    }
  };

  // Obtener especialidades del prestador seleccionado
  const especialidadesDisponibles = prestadorSeleccionado?.especialidades || [];

  // Obtener lugares de atención del prestador seleccionado
  const lugaresAtencionDisponibles = prestadorSeleccionado 
    ? obtenerLugaresAtencion(prestadorSeleccionado) 
    : [];

  // Obtener rangos permitidos para un día en un lugar del prestador
  const obtenerRangosPermitidos = (lugarDireccion, dia) => {
    if (!prestadorSeleccionado || !lugarDireccion || !dia) return [];
    const lugar = prestadorSeleccionado.lugaresAtencion?.find((l) => l.direccion === lugarDireccion);
    if (!lugar || !Array.isArray(lugar.horarios)) return [];
    const rangos = [];
    lugar.horarios.forEach((h) => {
      const dias = Array.isArray(h.dias) ? h.dias : [];
      if (dias.includes(dia)) {
        rangos.push({ inicio: h.horaInicio, fin: h.horaFin });
      }
    });
    return rangos;
  };

  const estaDentroDeRangos = (lugarDireccion, dia, horaInicio, horaFin) => {
    const rangos = obtenerRangosPermitidos(lugarDireccion, dia);
    if (rangos.length === 0) return true; // sin rangos => sin restricción
    if (!horaInicio || !horaFin) return false;
    return rangos.some((r) => horaInicio >= r.inicio && horaFin <= r.fin && horaInicio < horaFin);
  };

  // Utilidades para slots de tiempo
  const toMinutes = (hhmm) => {
    if (!hhmm || typeof hhmm !== 'string') return null;
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const toHHMM = (minutes) => {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  const getStartSlots = (lugarDireccion, dia, stepMinutos) => {
    const rangos = obtenerRangosPermitidos(lugarDireccion, dia);
    if (rangos.length === 0 || !stepMinutos) return [];
    const slots = [];
    rangos.forEach((r) => {
      const start = toMinutes(r.inicio);
      const end = toMinutes(r.fin);
      for (let t = start; t <= end - stepMinutos; t += stepMinutos) {
        slots.push(toHHMM(t));
      }
    });
    return slots;
  };

  const getEndSlots = (lugarDireccion, dia, stepMinutos, horaInicio) => {
    const rangos = obtenerRangosPermitidos(lugarDireccion, dia);
    if (rangos.length === 0 || !stepMinutos) return [];
    const startMin = toMinutes(horaInicio);
    // Buscar rango que contiene el inicio
    const rango = rangos.find((r) => startMin != null && startMin >= toMinutes(r.inicio) && startMin < toMinutes(r.fin));
    const considered = rango ? [rango] : rangos;
    const slots = [];
    considered.forEach((r) => {
      const start = rango ? startMin + stepMinutos : toMinutes(r.inicio) + stepMinutos;
      const end = toMinutes(r.fin);
      for (let t = start; t <= end; t += stepMinutos) {
        slots.push(toHHMM(t));
      }
    });
    return slots;
  };

  // Resumen visual de horarios del prestador para el lugar elegido
  const obtenerResumenHorariosLugar = (lugarDireccion) => {
    if (!prestadorSeleccionado || !lugarDireccion) return [];
    const lugar = prestadorSeleccionado.lugaresAtencion?.find((l) => l.direccion === lugarDireccion);
    if (!lugar || !Array.isArray(lugar.horarios)) return [];
    return lugar.horarios.map((h) => {
      const dias = (Array.isArray(h.dias) ? h.dias : []).join(', ');
      return `${dias}: ${h.horaInicio}-${h.horaFin}`;
    });
  };

  // Agregar nueva dirección
  const agregarDireccion = () => {
    setForm((prev) => ({
      ...prev,
      direcciones: [
        ...prev.direcciones,
        {
          lugar: '',
          duracion: 30,
          horarios: []
        }
      ]
    }));
  };

  // Prefill de horarios desde el prestador para el lugar elegido
  const prefillHorariosDesdePrestador = (direccionIndex, lugarDireccion) => {
    if (!prestadorSeleccionado || !lugarDireccion) return;
    const lugar = prestadorSeleccionado.lugaresAtencion?.find(
      (l) => l.direccion === lugarDireccion
    );
    if (!lugar || !Array.isArray(lugar.horarios)) return;
    // Convertir cada bloque (dias, horaInicio, horaFin) en entradas por día
    const horariosPrefill = [];
    lugar.horarios.forEach((h) => {
      const dias = Array.isArray(h.dias) ? h.dias : [];
      dias.forEach((dia) => {
        horariosPrefill.push({ dia, horaInicio: h.horaInicio, horaFin: h.horaFin });
      });
    });
    if (horariosPrefill.length === 0) return;

    // Solo prellenar si la dirección no tiene horarios cargados aún
    setForm((prev) => ({
      ...prev,
      direcciones: prev.direcciones.map((dir, i) =>
        i === direccionIndex && (!dir.horarios || dir.horarios.length === 0)
          ? { ...dir, horarios: horariosPrefill }
          : dir
      )
    }));
  };

  // Eliminar dirección
  const eliminarDireccion = (index) => {
    setForm((prev) => ({
      ...prev,
      direcciones: prev.direcciones.filter((_, i) => i !== index)
    }));
  };

  // Actualizar dirección
  const actualizarDireccion = (index, campo, valor) => {
    setForm((prev) => ({
      ...prev,
      direcciones: prev.direcciones.map((dir, i) =>
        i === index ? { ...dir, [campo]: valor } : dir
      )
    }));
  };

  // Agregar horario a una dirección
  const agregarHorario = (direccionIndex) => {
    setForm((prev) => ({
      ...prev,
      direcciones: prev.direcciones.map((dir, i) =>
        i === direccionIndex
          ? {
              ...dir,
              horarios: [
                ...dir.horarios,
                {
                  dia: '',
                  horaInicio: '',
                  horaFin: ''
                }
              ]
            }
          : dir
      )
    }));
  };

  // Eliminar horario
  const eliminarHorario = (direccionIndex, horarioIndex) => {
    setForm((prev) => ({
      ...prev,
      direcciones: prev.direcciones.map((dir, i) =>
        i === direccionIndex
          ? {
              ...dir,
              horarios: dir.horarios.filter((_, hi) => hi !== horarioIndex)
            }
          : dir
      )
    }));
  };

  // Actualizar horario
  const actualizarHorario = (direccionIndex, horarioIndex, campo, valor) => {
    setForm((prev) => ({
      ...prev,
      direcciones: prev.direcciones.map((dir, i) =>
        i === direccionIndex
          ? {
              ...dir,
              horarios: dir.horarios.map((h, hi) =>
                hi === horarioIndex ? { ...h, [campo]: valor } : h
              )
            }
          : dir
      )
    }));
  };

  // Validaciones
  const validar = () => {
    const errores = {};
    
    if (!form.prestadorId) {
      errores.prestador = 'Debe seleccionar un prestador';
    }
    
    if (!form.especialidad.trim()) {
      errores.especialidad = 'Especialidad requerida';
    }
    
    if (form.direcciones.length === 0) {
      errores.direcciones = 'Debe agregar al menos una dirección de atención';
    }

    form.direcciones.forEach((dir, i) => {
      if (!dir.lugar.trim()) {
        errores[`direccion_${i}_lugar`] = 'Dirección requerida';
      }
      // Validaciones de horarios deshabilitadas temporalmente
    });

    // Validación de conflictos deshabilitada temporalmente

    return errores;
  };

  const guardar = () => {
    setIntentoGuardar(true);
    const errores = validar();
    if (Object.keys(errores).length > 0) {
      if (errores.conflictosHorarios) {
        alert('⚠️ No se puede guardar: Hay conflictos en los horarios de turnos que deben resolverse primero.');
      } else {
        const mensajesError = Object.entries(errores)
          .map(([campo, mensaje]) => `• ${mensaje}`)
          .join('\n');
        alert('Por favor complete todos los campos requeridos:\n\n' + mensajesError);
      }
      return;
    }

    // Validar coherencia final
    if (!validacionCoherencia.valida) {
      alert('Hay errores de coherencia:\n' + validacionCoherencia.errores.join('\n'));
      return;
    }

    // Calcular turnos por semana por dirección
    const direccionesConTurnos = form.direcciones.map(dir => {
      let turnosPorSemana = 0;
      dir.horarios.forEach(h => {
        if (h.horaInicio && h.horaFin) {
          const [inicioHora, inicioMin] = h.horaInicio.split(':').map(Number);
          const [finHora, finMin] = h.horaFin.split(':').map(Number);
          const minutosTotales = (finHora * 60 + finMin) - (inicioHora * 60 + inicioMin);
          turnosPorSemana += Math.floor(minutosTotales / dir.duracion);
        }
      });
      return {
        ...dir,
        turnosPorSemana,
        horarios: dir.horarios.map(h => ({
          dia: h.dia,
          horario: `${h.horaInicio}-${h.horaFin}`
        })),
        fechaCreacion: dir.fechaCreacion || new Date().toLocaleDateString('es-AR')
      };
    });

    const totalTurnos = direccionesConTurnos.reduce((sum, dir) => sum + dir.turnosPorSemana, 0);

    onGuardar?.({
      ...form,
      direcciones: direccionesConTurnos,
      totalTurnos
    });
  };

  const errores = intentoGuardar ? validar() : {};

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800, color: '#111827' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleIcon color="primary" />
          <Typography variant="h6">
            {form.id ? 'Editar Agenda de Turnos' : 'Agregar Agenda de Turnos'}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          '& .MuiFormControlLabel-label': { fontWeight: 700, color: '#111827' },
          '& .MuiInputBase-input': { color: '#111827', fontWeight: 600 }
        }}
      >
        {/* Alerta general de conflictos */}
        {Object.keys(conflictosHorarios).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              ⚠️ Hay conflictos en los horarios de turnos
            </Typography>
            <Typography variant="body2">
              Por favor, revise y corrija los horarios que se solapan antes de guardar.
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Prestador */}
          <FormControl fullWidth error={!!errores.prestador}>
            <InputLabel sx={{ fontWeight: 700, color: '#111827' }}>Prestador</InputLabel>
            <Select
              value={form.prestadorId || ''}
              onChange={cambiar('prestadorId')}
              label="Prestador"
              sx={{ color: '#111827', fontWeight: 600 }}
            >
              {prestadores.map((prestador) => (
                <MenuItem key={prestador.id} value={prestador.id}>
                  {prestador.nombreCompleto} - {prestador.cuilCuit}
                </MenuItem>
              ))}
            </Select>
            {errores.prestador && <FormHelperText>{errores.prestador}</FormHelperText>}
          </FormControl>

          {/* Especialidad */}
          <FormControl 
            fullWidth 
            error={!!errores.especialidad}
            disabled={!prestadorSeleccionado}
          >
            <InputLabel sx={{ fontWeight: 700, color: '#111827' }}>Especialidad</InputLabel>
            <Select
              value={form.especialidad}
              onChange={cambiar('especialidad')}
              label="Especialidad"
              sx={{ color: '#111827', fontWeight: 600 }}
            >
              {especialidadesDisponibles.map((esp) => (
                <MenuItem key={esp.id} value={esp.nombre}>
                  {esp.nombre}
                </MenuItem>
              ))}
            </Select>
            {errores.especialidad && <FormHelperText>{errores.especialidad}</FormHelperText>}
            {!prestadorSeleccionado && (
              <FormHelperText>Primero selecciona un prestador</FormHelperText>
            )}
            {prestadorSeleccionado && especialidadesDisponibles.length === 0 && (
              <FormHelperText error>
                ⚠️ Este prestador no tiene especialidades registradas. Ve a Prestadores y edítalo para agregar especialidades.
              </FormHelperText>
            )}
          </FormControl>

          {/* Alertas de validación de coherencia */}
          {validacionCoherencia.errores.length > 0 && (
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Advertencias de coherencia:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validacionCoherencia.errores.map((error, idx) => (
                  <li key={idx}>
                    <Typography variant="caption">{error}</Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          )}
          
          {/* Aviso de coherencia removido a pedido: no mostrar cartel de éxito */}

          <Divider sx={{ my: 1 }} />

          {/* Direcciones y Horarios */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                Direcciones de Atención
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={agregarDireccion}
                sx={{ textTransform: 'none' }}
              >
                Agregar Dirección
              </Button>
            </Box>

            {errores.direcciones && (
              <Typography color="error" variant="caption" sx={{ display: 'block', mb: 2 }}>
                {errores.direcciones}
              </Typography>
            )}

            {prestadorSeleccionado && lugaresAtencionDisponibles.length === 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  ⚠️ Este prestador no tiene lugares de atención configurados
                </Typography>
                <Typography variant="caption">
                  Ve a la página de Prestadores, edita este prestador y agrega al menos un lugar de atención con sus horarios.
                </Typography>
              </Alert>
            )}

            {form.direcciones.map((direccion, dirIndex) => (
              <Card key={dirIndex} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOnIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Dirección {dirIndex + 1}
                      </Typography>
                    </Stack>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => eliminarDireccion(dirIndex)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Lugar */}
                    <Autocomplete
                      options={lugaresAtencionDisponibles}
                      getOptionLabel={(option) => option.direccion}
                      value={lugaresAtencionDisponibles.find(l => l.direccion === direccion.lugar) || null}
                      onChange={(e, newValue) => {
                        const nuevaDir = newValue?.direccion || '';
                        actualizarDireccion(dirIndex, 'lugar', nuevaDir);
                      }}
                      disabled={!prestadorSeleccionado}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Lugar de atención"
                          error={!!errores[`direccion_${dirIndex}_lugar`]}
                          helperText={
                            errores[`direccion_${dirIndex}_lugar`] ||
                            (prestadorSeleccionado ? 'Seleccione un lugar de atención del prestador' : 'Primero seleccione un prestador')
                          }
                          InputLabelProps={{ sx: { fontWeight: 700, color: '#111827' } }}
                        />
                      )}
                      fullWidth
                    />

                    {/* Resumen de horarios del prestador para el lugar seleccionado */}
                    {direccion.lugar && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                          Horarios del prestador en esta dirección
                        </Typography>
                        {obtenerResumenHorariosLugar(direccion.lugar).length > 0 ? (
                          obtenerResumenHorariosLugar(direccion.lugar).map((txt, i) => (
                            <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                              • {txt}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="caption">No hay horarios configurados para este lugar.</Typography>
                        )}
                      </Alert>
                    )}

                    {/* Duración del turno */}
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontWeight: 700, color: '#111827' }}>
                        Duración del turno (minutos)
                      </InputLabel>
                      <Select
                        value={direccion.duracion}
                        onChange={(e) => actualizarDireccion(dirIndex, 'duracion', e.target.value)}
                        label="Duración del turno (minutos)"
                        sx={{ color: '#111827', fontWeight: 600 }}
                      >
                        <MenuItem value={15}>15 minutos</MenuItem>
                        <MenuItem value={30}>30 minutos</MenuItem>
                        <MenuItem value={45}>45 minutos</MenuItem>
                        <MenuItem value={60}>60 minutos</MenuItem>
                      </Select>
                    </FormControl>

                    <Divider />

                    {/* Horarios removidos temporalmente */}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCerrar} sx={{ fontWeight: 700, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={guardar}
          sx={{ fontWeight: 700, textTransform: 'none' }}
        >
          {form.id ? 'Guardar Cambios' : 'Crear Agenda'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

