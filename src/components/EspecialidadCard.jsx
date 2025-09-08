import React from 'react';
import { Card, CardContent, Typography, Chip, Button, Box, Stack } from '@mui/material';
import { MedicalServices as MedicalIcon, Edit as EditIcon, ToggleOn, ToggleOff } from '@mui/icons-material';

const EspecialidadCard = ({ especialidad, onEdit, onToggleStatus }) => {
  const isActive = especialidad.activa;
  return (
    <Card sx={{ mb: 2, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MedicalIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {especialidad.nombre}
              </Typography>
              <Chip label={isActive ? 'Activa' : 'Inactiva'} color={isActive ? 'success' : 'error'} size="small" sx={{ fontWeight: 500, borderRadius: '12px' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              {especialidad.descripcion}
            </Typography>
          </Box>

          <Stack direction="column" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Button type="button" variant="text" startIcon={<EditIcon />} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(especialidad); }}
              sx={{ color: '#2563eb', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.75rem', width: 160, height: 40, justifyContent: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', border: '1px solid #2563eb', borderRadius: 1, '&:hover': { backgroundColor: '#2563eb', color: 'white' } }}>
              Editar
            </Button>
            <Button type="button" variant="text" startIcon={isActive ? <ToggleOff /> : <ToggleOn />} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleStatus?.(especialidad); }}
              sx={{ color: isActive ? 'error.main' : 'success.main', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.75rem', width: 160, height: 40, justifyContent: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', border: `1px solid ${isActive ? 'error.main' : 'success.main'}`, borderRadius: 1, '&:hover': { backgroundColor: isActive ? 'error.light' : 'success.light', color: 'white' } }}>
              {isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EspecialidadCard;


