import React from 'react';
import { Button } from '@mui/material';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

export default function BotonAlternarEstado({ activo = true, onClick, ancho = 160, alto = 40 }) {
  const color = activo ? 'error' : 'success';
  const texto = activo ? 'Desactivar' : 'Activar';
  const Icono = activo ? ToggleOffIcon : ToggleOnIcon;

  return (
    <Button
      type="button"
      variant="text"
      startIcon={<Icono />}
      onClick={(e) => { e.preventDefault?.(); e.stopPropagation?.(); onClick?.(e); }}
      color={color}
      sx={{
        textTransform: 'uppercase',
        fontWeight: 600,
        fontSize: '0.75rem',
        width: ancho,
        height: alto,
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        border: theme => `1px solid ${theme.palette[color].main}`,
        borderRadius: 1,
        '&:hover': { backgroundColor: theme => theme.palette[color].light, color: 'white' },
      }}
    >
      {texto}
    </Button>
  );
}


