import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function EstadoFilter({ value, onChange, label = 'Estado', sx }) {
  return (
    <FormControl size="small" sx={{ width: 220, ...sx }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(e) => onChange?.(e.target.value)}>
        <MenuItem value="activos">Activos</MenuItem>
        <MenuItem value="inactivos">Inactivos</MenuItem>
        <MenuItem value="todos">Todos</MenuItem>
      </Select>
    </FormControl>
  );
}


