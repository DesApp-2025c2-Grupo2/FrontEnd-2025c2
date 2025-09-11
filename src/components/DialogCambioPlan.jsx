
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useState } from 'react';

export default function DialogCambioPlan({ grupo, open, planes, onClose }){
    if (!grupo) return null;
    const [planSeleccionado, setPlanSeleccionado] = useState(grupo?.planMedico || "");

  const handleChange = (event) => {
    setPlanSeleccionado(event.target.value);
  };

  const handleGuardar = () => {
    console.log(`Cambiar plan de ${grupo.nombre} a: ${planSeleccionado}`);
    //Por ahora, lo dejaremos así hasta tener la conexión con el Back
    onClose();
  };
    
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
          <DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <CreditCardIcon color="secondary" />
              <Typography variant="h6" color="#555555ff">Cambiar Plan Médico</Typography>
            </Stack>
          </DialogTitle>
    
          <DialogContent dividers>
            <Typography variant="subtitle1" color="#555555ff">
              <Box component="span" fontWeight="bold"> Grupo Familiar: </Box>Familia {grupo.nombre}
            </Typography>
    
            <Typography variant="body2" color="text.secondary">
              N° de Afiliado: {grupo.id}
            </Typography>

            <FormControl fullWidth sx={{mt: 2}}>
                <InputLabel id="plan-label">Nuevo plan</InputLabel>
                <Select
                labelId="plan-label"
                value={planSeleccionado}
                onChange={handleChange}
                label="Nuevo plan"
                sx={{color: "black"}}
                >
                    {planes.map((plan, index) => (
                        <MenuItem key={index} value={plan.nombre}>
                        {plan.nombre}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

          </DialogContent>
    
          <DialogActions>
            <Button onClick={onClose} sx={{ textTransform: "none" }}  color="secondary">
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              sx={{ textTransform: "none" }}
              onClick={handleGuardar}
            >
              Guardar cambios
            </Button>
          </DialogActions>
        </Dialog>
      );
}