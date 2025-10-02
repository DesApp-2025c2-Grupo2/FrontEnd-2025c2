import React from 'react';
import { Button, Chip, Card, CardContent, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BotonAlternarEstado from './BotonAlternarEstado.jsx';

export default function EspecialidadCard({ especialidad, onEdit, onToggleStatus }) {
  return (
    <Card sx={{ mb: 2, boxShadow: 2, borderRadius: 2, border: '1px solid #e9ecef', backgroundColor: '#fff' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={1} flex={1}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>{especialidad.nombre}</Typography>
              <Chip label={especialidad.activa ? 'Activa' : 'Inactiva'} size="small" color={especialidad.activa ? 'success' : 'default'} sx={{ borderRadius: 999 }} />
            </Stack>
            {especialidad.descripcion ? (
              <Typography variant="body2" sx={{ color: '#6b7280' }}>{especialidad.descripcion}</Typography>
            ) : null}
          </Stack>
          <Stack spacing={0.5} alignItems="flex-end" sx={{ minWidth: 170 }}>
            <Button
              type="button"
              variant="text"
              startIcon={<EditIcon />}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(especialidad); }}
              sx={{ color: '#2563eb', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.75rem', width: 160, height: 40, justifyContent: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', border: '1px solid #2563eb', borderRadius: 1, '&:hover': { backgroundColor: '#2563eb', color: 'white' } }}
            >
              Editar
            </Button>
            <BotonAlternarEstado activo={!!especialidad.activa} onClick={() => onToggleStatus?.(especialidad)} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}


