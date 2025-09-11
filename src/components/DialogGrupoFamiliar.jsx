import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Divider, Button, Stack, Box} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TarjetaAfiliadoMuestra from "./TarjetaAfiliadoMuestra";
import { useState } from "react";
import DialogAgregarAfiliado from "./DialogAgregarAfiliado";

// Función para pruebas
const getNombrePlan = function(idPlan, planes) {
  return planes.find(e => idPlan === e.id).nombre
}

export default function DialogGrupoFamiliar({ grupo, open, onClose, integrantes, planes}) {
  const [openAgregarIntegrante, setOpenAgregarIntegrante] = useState(false)

  if (!grupo) return null; // No renderiza si no hay grupo 

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <GroupIcon color="secondary" />
          <Typography variant="h6" color="#555555ff">Detalles del Grupo Familiar</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} color="#555555ff">
          Familia {grupo.nombre}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          N° de Afiliado: {grupo.id}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Plan Médico: {getNombrePlan(grupo.planMedico, planes)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }} color="#555555ff">
          Integrantes del grupo familiar
        </Typography>

        {integrantes?.map((afiliado, index) => ( //Esto posiblemente deba cambiarse cuando esté la conexión con BE
          <TarjetaAfiliadoMuestra key={index} afiliado={afiliado} grupo={grupo}/>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}  color="secondary">
          Cerrar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<PersonAddIcon />}
          sx={{ textTransform: "none" }}
          onClick={() => {setOpenAgregarIntegrante(true)}}
        >
          Agregar integrante
        </Button>
      </DialogActions>
      <DialogAgregarAfiliado 
      grupo={grupo}
      open={openAgregarIntegrante}
      onClose={() =>{
        setOpenAgregarIntegrante(false)
      }}
      planes={planes}
      />
    </Dialog>
  );
}
