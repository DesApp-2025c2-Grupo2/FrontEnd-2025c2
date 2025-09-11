import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const BotonFlotante = ({ onClick, title = 'Agregar' }) => {
  return (
    <Tooltip title={title} placement="left">
      <Fab color="secondary" aria-label="add" onClick={onClick} sx={{ position: 'fixed', bottom: 24, right: 24 }}>
        <AddIcon />
      </Fab>
    </Tooltip>
  );
};

export default BotonFlotante;


