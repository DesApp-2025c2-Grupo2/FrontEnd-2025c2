import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchField({ value, onChange, placeholder = 'Buscar...', sx }) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      sx={{ width: 350, ...sx }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}


