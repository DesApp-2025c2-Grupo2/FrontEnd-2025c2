import { Box, Card, CardContent, Typography } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';

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

export default function TarjetaAfiliadoMuestra({afiliado, grupo}){
    return (
        <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PersonIcon sx={{ fontSize: 40 }} color="secondary"/>
                <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>  
                    <Typography variant="h5" color="black">{afiliado.apellido}, {afiliado.nombre}</Typography>
                    <Typography variant="body1" color="textSecondary">
                        <Box component="span" fontWeight="bold">DNI:</Box> {afiliado.dni} | {" "}
                        <Box component="span" fontWeight="bold">Credencial: </Box> {grupo.id}-{afiliado.nroIntegrante} 
                    </Typography>
                
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1}}>
                        <Box sx={{ 
                        mt: 1,
                        alignSelf: "start",
                        backgroundColor: "transparent",
                        border: "1px solid",
                        borderColor: "secondary",
                        color: "secondary",
                        px: 2,
                        py: 0.3,
                        borderRadius: "999px",
                        display: "inline-block",
                        fontWeight: "bold",}}>
                        {getNombreParentesco(afiliado.parentesco, parentescos)}
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}