import React from 'react';
import { Button, Chip, Card, CardContent, Stack, Typography, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BotonAlternarEstado from './BotonAlternarEstado.jsx';
import { useSelector } from 'react-redux';
import { selectPrestadores } from '../store/prestadoresSlice';

export default function TarjetaPrestadorSimple({ prestador, onVer, onEditar, onToggleActivo }) {
  const todosPrestadores = useSelector(selectPrestadores);
  const centroNombre = prestador.integraCentroMedicoId
    ? (todosPrestadores || []).find(p => p.id === prestador.integraCentroMedicoId)?.nombreCompleto
    : null;

  return (
    <Card sx={{ 
      mb: 2, 
      boxShadow: 2, 
      borderRadius: 2, 
      border: `1px solid ${prestador.activo ? '#e9ecef' : '#d1d5db'}`, 
      backgroundColor: prestador.activo ? '#fff' : '#f3f4f6',
      opacity: prestador.activo ? 1 : 0.7
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={1} flex={1}>
            {/* Nombre y CUIL */}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="h6" sx={{ fontWeight: 700, color: prestador.activo ? '#1f2937' : '#6b7280' }}>
                {prestador.nombreCompleto}
              </Typography>
              <Chip 
                label={`CUIL/CUIT: ${prestador.cuilCuit}`} 
                size="small" 
                variant="outlined" 
                sx={{ borderRadius: 999 }} 
              />
            </Stack>

            {/* Tipo de prestador */}
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {prestador.tipo}
            </Typography>
            {prestador.tipo === 'Profesional Independiente' && centroNombre && (
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                Integra centro: <strong>{centroNombre}</strong>
              </Typography>
            )}

            {/* Especialidades */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {prestador.especialidades.map((esp, idx) => (
                <Chip
                  key={idx}
                  label={esp.nombre}
                  size="small"
                  sx={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 600,
                    borderRadius: 999
                  }}
                />
              ))}
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
                onVer?.(prestador); 
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
                onEditar?.(prestador); 
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
              activo={!!prestador.activo} 
              onClick={() => onToggleActivo?.(prestador)} 
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

