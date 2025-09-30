import React from 'react';
import { Button, Chip, Card, CardContent, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BotonAlternarEstado from './BotonAlternarEstado.jsx';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });

export default function TarjetaPlan({ plan, onEditar, onAlternarActivo, onEliminar }) {
  return (
    <Card sx={{ mb: 2, boxShadow: 2, borderRadius: 2, border: '1px solid #e9ecef', backgroundColor: '#fff' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={1} flex={1}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>{plan.nombre}</Typography>
              <Chip label={`Código: ${plan.codigo}`} size="small" variant="outlined" sx={{ borderRadius: 999 }} />
              <Chip label={plan.activo ? 'Activo' : 'Inactivo'} size="small" color={plan.activo ? 'success' : 'default'} sx={{ borderRadius: 999 }} />
            </Stack>
            {plan.descripcion ? (
              <Typography variant="body2" sx={{ color: '#6b7280' }}>{plan.descripcion}</Typography>
            ) : null}
            <Typography variant="h6" sx={{ color: '#059669', fontWeight: 800, mt: 0.5 }}>
              {currency.format(Number(plan.precio || 0))}
            </Typography>
          </Stack>
          <Stack spacing={0.5} alignItems="flex-end" sx={{ minWidth: 170 }}>
            <Button
              type="button"
              variant="text"
              startIcon={<EditIcon />}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditar?.(plan); }}
              sx={{ color: '#2563eb', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.75rem', width: 160, height: 40, justifyContent: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', border: '1px solid #2563eb', borderRadius: 1, '&:hover': { backgroundColor: '#2563eb', color: 'white' } }}
            >
              Editar
            </Button>
            <BotonAlternarEstado activo={!!plan.activo} onClick={() => onAlternarActivo?.(plan)} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}


