import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function SnackbarMini({ open, message, severity = 'success', onClose, autoHideDuration = 2500, anchorOrigin = { vertical: 'top', horizontal: 'right' } }) {
  return (
    <Snackbar anchorOrigin={anchorOrigin} open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
      <Alert severity={severity} onClose={onClose} sx={{ fontSize: 13, px: 1.5, py: 0.5, borderRadius: 1 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}


