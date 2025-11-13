import React from 'react';
import { Button, Chip, Card, Typography, Box, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, CircularProgress, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';
import { selectPrestadores } from '../store/prestadoresSlice';
import { selectEspecialidades } from '../store/especialidadesSlice';

export default function TarjetaPrestadorSimple({ prestador, onVer, onEditar, onToggleActivo, onGestionarHorarios, emphasis = false, isRefreshing = false }) {
  const todosPrestadores = useSelector(selectPrestadores);
  const centroNombre = (() => {
    if (prestador.integraCentroMedicoId) {
      const c = (todosPrestadores || []).find(p => p.id === prestador.integraCentroMedicoId);
      if (c && c.nombreCompleto) return c.nombreCompleto;
    }
    return prestador.centroMedicoNombre || prestador.centroMedico || null;
  })();

  const getTipoColor = (tipo) => ({
    'Centro Médico': '#546e7a',
    'Profesional Independiente': '#1976d2'
  }[tipo] || '#757575');

  const formatHorario = (h) => {
    const desde = h.desde || h.horaInicio || '';
    const hasta = h.hasta || h.horaFin || '';
    const dias = Array.isArray(h.dias) ? h.dias.join('/') : '';
    if (!dias && !desde && !hasta) return '';
    return dias ? `${dias}: ${desde} - ${hasta}` : `${desde} - ${hasta}`;
  };

  const diasSemanaOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const canonDia = (d) => {
    const t = String(d || '').trim().toLowerCase();
    if (!t) return '';
    if (t === 'miercoles') return 'Miércoles';
    if (t === 'sabado') return 'Sábado';
    const map = { lunes: 'Lunes', martes: 'Martes', miércoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sábado: 'Sábado', domingo: 'Domingo' };
    return map[t] || (t.charAt(0).toUpperCase() + t.slice(1));
  };
  const catalogoEspecialidades = useSelector(selectEspecialidades);
  const especialidadIdToNombre = React.useMemo(() => {
    const map = new Map();
    // Preferir catálogo global si existe
    (catalogoEspecialidades || []).forEach((e) => {
      if (e && typeof e.id === 'number') map.set(e.id, e.nombre);
    });
    // Completar con las del prestador por si hay extras
    (prestador.especialidades || []).forEach((e) => {
      if (e && typeof e.id === 'number' && !map.has(e.id)) map.set(e.id, e.nombre);
    });
    return map;
  }, [catalogoEspecialidades, prestador.especialidades]);

  return (
    <Card
      sx={{
        p: 2,
        mb: 2, 
        border: prestador.activo ? '1px solid #e0e0e0' : '1px solid #d1d5db',
        backgroundColor: prestador.activo ? (emphasis ? '#fffef7' : 'white') : '#f3f4f6',
        opacity: prestador.activo ? 1 : 0.7,
        boxShadow: emphasis ? 6 : 'none',
        borderColor: emphasis ? '#ffb300' : (prestador.activo ? '#e0e0e0' : '#d1d5db'),
        transition: 'background-color 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <PersonIcon sx={{ fontSize: 40, color: '#1976d2' }} />
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: prestador.activo ? 'inherit' : '#6b7280' }}>
                {prestador.nombreCompleto}
              </Typography>
              <Chip 
              label={prestador.tipo}
                size="small" 
              sx={{ backgroundColor: getTipoColor(prestador.tipo), color: 'white', fontWeight: 'bold' }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              <strong>CUIL/CUIT:</strong> {prestador.cuilCuit}
            </Typography>
            {prestador.matricula && (
              <Typography variant="body2" color="textSecondary">
                <strong>Matrícula:</strong> {prestador.matricula}
              </Typography>
            )}
            {prestador.tipo === 'Profesional Independiente' && centroNombre && (
              <Typography variant="body2" color="textSecondary">
                <strong>Integra centro:</strong> {centroNombre}
              </Typography>
            )}
          </Box>

          {prestador.especialidades && prestador.especialidades.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {prestador.especialidades.map((esp, idx) => (
                <Chip
                  key={idx}
                  label={esp.nombre}
                  size="small"
                  sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 600 }}
                />
              ))}
            </Box>
          )}

          {/* Lugares de atención movidos fuera de la fila principal para ocupar ancho completo */}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 3, minWidth: 140 }}>
            <Button
            size="small"
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                onVer?.(prestador); 
              }}
            variant="outlined"
            fullWidth
          >
            Ver
            </Button>
            <Button
            size="small"
              startIcon={<EditIcon />}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                onEditar?.(prestador); 
              }}
            variant="outlined"
            fullWidth
            >
              Editar
            </Button>
          <Button
            size="small"
            startIcon={<ScheduleIcon />}
            color={prestador.activo ? 'error' : 'success'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleActivo?.(prestador);
            }}
            variant="outlined"
            fullWidth
          >
            {prestador.activo ? 'Dar de baja' : 'Rehabilitar'}
          </Button>
        </Box>
      </Box>
      {prestador.lugaresAtencion && prestador.lugaresAtencion.length > 0 && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">
              Lugares de Atención ({prestador.lugaresAtencion.length})
            </Typography>
            {isRefreshing && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <CircularProgress size={14} sx={{ ml: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>actualizando…</Typography>
              </Box>
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {prestador.lugaresAtencion.map((lugar, idx) => (
                <Card key={idx} variant="outlined" sx={{ p: 1.5, borderColor: '#e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {lugar.direccion}
                      </Typography>
                      {lugar.localidad && (
                        <Typography variant="body2" color="textSecondary">
                          • {lugar.localidad}
                        </Typography>
                      )}
                      {lugar.codigoPostal && (
                        <Typography variant="body2" color="textSecondary">
                          • CP {lugar.codigoPostal}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {typeof lugar.especialidadSeleccionada === 'string' && lugar.especialidadSeleccionada.trim() !== '' && (
                        <Chip
                          label={lugar.especialidadSeleccionada}
                          size="small"
                          sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 600 }}
                        />
                      )}
                      <Tooltip title="Editar horarios">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onGestionarHorarios?.(prestador, idx);
                          }}
                          aria-label="Editar horarios"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {/* Eliminar dirección se realiza desde Editar Prestador */}
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <ScheduleIcon color="action" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Horarios de Atención
                      </Typography>
                    </Stack>
                    {Array.isArray(lugar.horarios) && lugar.horarios.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {(lugar.horarios || []).map((h, i) => {
                          const dias = Array.isArray(h.dias) ? h.dias.map(canonDia).filter(Boolean) : [];
                          const inicio = h.horaInicio || h.desde || '';
                          const fin = h.horaFin || h.hasta || '';
                          const dur = (typeof h.duracionMinutos === 'number' && h.duracionMinutos > 0) ? h.duracionMinutos : undefined;
                          const espId = (Array.isArray(h.especialidades) && h.especialidades.length > 0)
                            ? h.especialidades[0]
                            : ((typeof h.especialidadId === 'number' && h.especialidadId > 0) ? h.especialidadId : null);
                          const espNombre = (espId != null) ? especialidadIdToNombre.get(espId) : null;
                          return (
                            <Box
                              key={i}
                              sx={{
                                backgroundColor: '#eaf2ff',
                                border: '1px solid #c7d7fe',
                                borderRadius: 1.5,
                                p: 1.25
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ color: '#1e40af', fontWeight: 700, mb: 0.25 }}>
                                {dias.length > 0 ? dias.join(', ') : 'Horario'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {espNombre ? `${espNombre} • ` : ''}
                                {inicio} - {fin}
                                {dur ? ` • ${dur} min` : ''}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No hay horarios cargados.</Typography>
                    )}
                  </Box>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Card>
  );
}

