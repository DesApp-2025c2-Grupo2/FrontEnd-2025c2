import { Box, Button, Card, CardContent, CardMedia, Typography } from "@mui/material"
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';
const coloresPlan = {
  "Plan 360": "#4caf50",      // verde
  "Plan 240": "#2196f3",      // azul
  "Plan Platino": "#9c27b0",  // morado
  "Plan Básico": "#ff9800"    // naranja
};

// Función para pruebas
const getNombrePlan = function(idPlan, planes) {
  return planes.find(e => idPlan === e.id).nombre
}

function TarjetaFamiliar({familia, titularFamilia, cantAfiliados, onVerDetalles, onCambiarPlan, planes}){
    const planDeFamilia = getNombrePlan(familia.planMedico, planes)
    
    return (
        <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PeopleIcon sx={{ fontSize: 40 }} color="secondary"/>
                <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>  
                    <Typography variant="h5" color="black">Familia {familia.nombre}</Typography>
                    <Typography variant="body1" color="textSecondary">
                        <Box component="span" fontWeight="bold">N° Afiliado:</Box> {familia.id} | {" "}
                        <Box component="span" fontWeight="bold">DNI Titular: </Box> {titularFamilia.dni} 
                    </Typography>
                    <Typography color="#555555ff">
                        <PersonIcon sx={{fontSize: 20, verticalAlign: "middle"}}/>
                        {cantAfiliados} {cantAfiliados === 1 ? "integrante" : "integrantes"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1}}>
                        <Box sx={{ 
                        mt: 1,
                        alignSelf: "start",
                        backgroundColor: coloresPlan[planDeFamilia] || "grey",
                        color: "white",
                        px: 2,
                        py: 0.3,
                        borderRadius: "999px",
                        display: "inline-block",
                        fontWeight: "bold",}}>
                        {planDeFamilia}
                        </Box>
                        <Typography sx={{fontSize: "0.8rem", color: "grey", lineHeight: 1 }}>Alta: {familia.alta}</Typography>
                    </Box>
                </Box>
                <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                    <Button variant="outlined" color="secondary" startIcon={<VisibilityIcon/>} onClick={() => onVerDetalles(familia)}> Ver detalle</Button>
                    <Button variant="outlined" color="secondary" startIcon={<CreditCardIcon/>} onClick={() =>onCambiarPlan(familia)}> Cambiar plan</Button>
                    <Button variant="contained" color="error" startIcon={<PersonOffIcon/>}> Dar de baja</Button>
                </Box>
            </CardContent>
        </Card>
    )
}
export default TarjetaFamiliar