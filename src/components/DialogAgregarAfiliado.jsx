
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import EmailIcon from '@mui/icons-material/Email';
import AddIcon from '@mui/icons-material/Add';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';

// Función para pruebas
const getNombrePlan = function(idPlan, planes) {
  return planes.find(e => idPlan === e.id).nombre
}

//Lista de parentescos
const parentescos = [
    {id: 1, nombre: "Titular"},
    {id: 2, nombre: "Cónyuge"},
    {id: 3, nombre: "Hijo"},
    {id: 4, nombre: "Familiar a cargo"},
]
//Funciones para pruebas
const getNombreParentesco = function(idParentesco, parentescos) {
  return parentescos.find(e => idParentesco === e.id).nombre
}

export default function DialogAgregarAfiliado({grupo, open, onClose, planes}){
    const [parentescoSeleccionado, setParentescoSeleccionado] = useState(null);
    
      const handleChange = (event) => {
        setParentescoSeleccionado(event.target.value);
      };
    
      const handleGuardar = () => {
        //Por ahora, lo dejaremos así hasta tener la conexión con el Back
        onClose();
      };
    
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                  <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonAddIcon color="secondary"/>
                      <Typography variant="h6" color="#555555ff">Agregar integrante al Grupo Familiar</Typography>
                    </Stack>
                  </DialogTitle>
            
                  <DialogContent dividers>
                    <Typography variant="subtitle1" color="#555555ff">
                      <Box component="span" fontWeight="bold"> Grupo Familiar: </Box>Familia {grupo.nombre}
                    </Typography>
            
                    <Typography variant="body2" color="text.secondary">
                      Plan Médico: {getNombrePlan(grupo.planMedico, planes)} (Se usará por defecto)
                    </Typography>
        
                    <TextField
                    required
                    id="nombre-integrante"
                    label="Nombre"
                    />
                    <TextField
                    required
                    id="apellido-integrante"
                    label="Apellido"
                    />
                    <TextField
                    required
                    id="dni-integrante"
                    label="Número de documento"
                    />
                    <FormControl fullWidth sx={{mt: 2}}>
                        <InputLabel id="parentesco-label"> Seleccione parentesco</InputLabel>
                        <Select
                        labelId="parentesco-label"
                        value={parentescoSeleccionado}
                        onChange={handleChange}
                        label="Seleccione parentesco"
                        sx={{color: "black"}}
                        >
                            {parentescos.map((parentesco) => (
                                <MenuItem key={parentesco.id} value={parentesco.nombre}>
                                {parentesco.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                    label="Fecha de nacimiento"
                    type="date"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    fullWidth
                    sx={{mt: 2}}
                    />

                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <EmailIcon/>
                                <Typography> Emails</Typography>
                            </Box>
                            <TextField placeholder="Agregar email"></TextField>
                            <Button>
                                <AddIcon color="secondary"/>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <PhoneIcon/>
                                <Typography> Teléfonos</Typography>
                            </Box>
                            <TextField placeholder="Agregar teléfono"></TextField>
                            <Button>
                                <AddIcon color="secondary"/>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <HomeIcon/>
                                <Typography> Direcciones</Typography>
                            </Box>
                            <TextField placeholder="Agregar direcciones"></TextField>
                            <Button>
                                <AddIcon color="secondary"/>
                            </Button>
                        </CardContent>
                    </Card>
        
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
                      Agregar integrante
                    </Button>
                  </DialogActions>
                </Dialog>
    )
}