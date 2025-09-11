import React, { useState } from 'react'; // Importa React y useState
import {
  Box, // Contenedor principal
  Typography, // Componente de texto
  TextField, // Campo de entrada
  InputAdornment, // Adorno del campo
  Card, // Tarjeta
  CardContent, // Contenido de tarjeta
  Grid, // Sistema de grilla
  Button, // Botón
  Chip, // Etiqueta
  Divider, // Separador
  Fab // Botón flotante
} from '@mui/material';
import {
  Search as SearchIcon, // Ícono de búsqueda
  Visibility as VisibilityIcon, // Ícono de ver
  Edit as EditIcon, // Ícono de editar
  PowerSettingsNew as PowerSettingsNewIcon, // Ícono de estado
  Person as PersonIcon, // Ícono de persona para afiliados
  Add as AddIcon // Ícono de agregar
} from '@mui/icons-material';

function Afiliados() { // Componente principal
  const [searchTerm, setSearchTerm] = useState(''); // Estado de búsqueda

  // Array de afiliados con estado controlado
  const [afiliados, setAfiliados] = useState([
    {
      id: 1, // ID único
      nombre: 'Gómez, Pedro', // Nombre del afiliado
      credencial: '0000001-01', // Credencial del afiliado
      dni: '12345678', // DNI del afiliado
      plan: 'Plan 310', // Plan de cobertura
      estado: 'Activo', // Estado actual
      grupoFamiliar: 'Titular', // Rol en el grupo familiar
      alta: '14/1/2024', // Fecha de alta
      infoAdicional: [] // Sin información adicional
    },
    {
      id: 2,
      nombre: 'Gómez, María',
      credencial: '0000001-02',
      dni: '87654321',
      plan: 'Plan 310',
      estado: 'Activo',
      grupoFamiliar: 'Cónyuge',
      alta: '14/1/2024',
      infoAdicional: ['Embarazo'] // Información adicional
    },
    {
      id: 3,
      nombre: 'López, Ana',
      credencial: '0000002-01',
      dni: '11223344',
      plan: 'Plan 510',
      estado: 'Activo',
      grupoFamiliar: 'Titular',
      alta: '31/1/2024',
      infoAdicional: ['Diabetes'] // Información adicional
    },
    {
      id: 4,
      nombre: 'Rodríguez, Carlos',
      credencial: '0000001-03',
      dni: '55667788',
      plan: 'Plan 310',
      estado: 'Activo',
      grupoFamiliar: 'Hijo',
      alta: '10/6/2021',
      infoAdicional: [] // Sin información adicional
    }
  ]);

  // Función para cambiar el estado del afiliado
  const handleCambiarEstado = (id) => {
    setAfiliados(prevAfiliados =>
      prevAfiliados.map(afiliado =>
        afiliado.id === id
          ? {
              ...afiliado,
              estado: afiliado.estado === 'Activo' ? 'Inactivo' : 'Activo'
            }
          : afiliado
      )
    );
  };

  // Función que retorna el color según el plan
  const getPlanColor = (plan) => {
    const planColors = {
      'Plan 310': '#2196f3', // Azul para plan 310
      'Plan 510': '#9c27b0' // Morado para plan 510
    };
    return planColors[plan] || '#2196f3';
  };

  // Función que retorna el color según el estado
  const getEstadoColor = (estado) => {
    const estadoColors = {
      'Activo': '#4caf50', // Verde para activo
      'Inactivo': '#f44336', // Rojo para inactivo
      'Pendiente': '#ff9800' // Naranja para pendiente
    };
    return estadoColors[estado] || '#4caf50';
  };

  // Función que retorna el color según el grupo familiar
  const getGrupoFamiliarColor = (grupo) => {
    const grupoColors = {
      'Titular': '#2196f3', // Azul para titular
      'Cónyuge': '#4caf50', // Verde para cónyuge
      'Hijo': '#2196f3', // Azul para hijo
      'Hija': '#2196f3' // Azul para hija
    };
    return grupoColors[grupo] || '#2196f3';
  };

  // Función que retorna el color según la información adicional
  const getInfoAdicionalColor = (info) => {
    const infoColors = {
      'Embarazo': '#ff9800', // Naranja para embarazo
      'Diabetes': '#ff9800' // Naranja para diabetes
    };
    return infoColors[info] || '#ff9800';
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}> {/* Contenedor principal responsive */}
      {/* Header de la página */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          color: 'text.primary', 
          mb: { xs: 0.5, sm: 1 }, 
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2.125rem' }
        }}
      >
        Afiliados {/* Título principal */}
      </Typography>
      <Typography 
        variant="subtitle1" 
        color="text.secondary" 
        gutterBottom 
        sx={{ 
          mb: { xs: 3, sm: 4 }, 
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}
      >
        Gestión de afiliados y grupos familiares {/* Subtítulo */}
      </Typography>

      {/* Campo de búsqueda */}
      <TextField
        fullWidth // Ocupa todo el ancho
        variant="outlined" // Variante con borde
        placeholder="Buscar por nombre, DNI, credencial, plan o grupo familiar..." // Texto de ayuda
        value={searchTerm} // Valor controlado
        onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el estado
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" /> {/* Ícono de lupa */}
            </InputAdornment>
          ),
        }}
        sx={{
          mb: { xs: 3, sm: 4 },
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }
        }}
      />

      {/* Lista de afiliados */}
      <Box sx={{ mb: 4 }}>
        {afiliados.map((afiliado, index) => (
          <Box key={afiliado.id}>
                         <Card 
               elevation={1} // Sombra sutil
               sx={{
                 mb: { xs: 1.5, sm: 2 },
                 borderRadius: 2,
                 border: '1px solid #e0e0e0',
                 backgroundColor: afiliado.estado === 'Inactivo' ? '#f5f5f5' : 'white', // Fondo gris si está inactivo
                 opacity: afiliado.estado === 'Inactivo' ? 0.8 : 1, // Opacidad reducida si está inactivo
                 transition: 'all 0.3s ease' // Transición suave
               }}
             >
               <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                 <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="stretch">
                   {/* Columna de información */}
                   <Grid item xs={12} lg={8} md={7}>
                     <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                       {/* Header con nombre e ícono */}
                       <Box sx={{ 
                         display: 'flex', 
                         alignItems: 'center', 
                         mb: { xs: 1.5, sm: 2 },
                         flexWrap: 'wrap',
                         gap: 1
                       }}>
                         <PersonIcon sx={{ 
                           color: 'text.secondary', 
                           fontSize: { xs: 18, sm: 20 },
                           minWidth: { xs: 18, sm: 20 }
                         }} />
                         <Typography 
                           variant="h5" 
                           component="h3" 
                           sx={{ 
                             fontWeight: 'bold', 
                             fontSize: { xs: '1.1rem', sm: '1.25rem' },
                             wordBreak: 'break-word'
                           }}
                         >
                           {afiliado.nombre}
                         </Typography>
                       </Box>
                       
                       {/* Chips de plan y estado */}
                       <Box sx={{ 
                         display: 'flex', 
                         gap: { xs: 1, sm: 1.5 }, 
                         mb: { xs: 1.5, sm: 2 },
                         flexWrap: 'wrap'
                       }}>
                         <Chip
                           label={afiliado.plan}
                           size="small"
                           sx={{
                             backgroundColor: getPlanColor(afiliado.plan),
                             color: 'white',
                             fontWeight: 'bold',
                             fontSize: { xs: '0.75rem', sm: '0.875rem' },
                             height: { xs: 24, sm: 28 }
                           }}
                         />
                         <Chip
                           label={afiliado.estado}
                           size="small"
                           sx={{
                             backgroundColor: getEstadoColor(afiliado.estado),
                             color: 'white',
                             fontWeight: 'bold',
                             fontSize: { xs: '0.75rem', sm: '0.875rem' },
                             height: { xs: 24, sm: 28 }
                           }}
                         />
                       </Box>
                       
                       {/* Detalles del afiliado */}
                       <Box sx={{ 
                         display: 'flex', 
                         flexDirection: 'column', 
                         gap: { xs: 0.5, sm: 0.8 }, 
                         mb: { xs: 1.5, sm: 2 },
                         flex: 1
                       }}>
                         <Typography variant="body2" color="text.secondary" sx={{ 
                           fontSize: { xs: '0.8rem', sm: '0.9rem' },
                           wordBreak: 'break-word'
                         }}>
                           <strong>Credencial:</strong> {afiliado.credencial}
                         </Typography>
                         <Typography variant="body2" color="text.secondary" sx={{ 
                           fontSize: { xs: '0.8rem', sm: '0.9rem' },
                           wordBreak: 'break-word'
                         }}>
                           <strong>DNI:</strong> {afiliado.dni}
                         </Typography>
                         <Typography variant="body2" color="text.secondary" sx={{ 
                           fontSize: { xs: '0.8rem', sm: '0.9rem' },
                           wordBreak: 'break-word'
                         }}>
                           <strong>Alta:</strong> {afiliado.alta}
                         </Typography>
                       </Box>
                       
                       {/* Botones del grupo familiar e información adicional */}
                       <Box sx={{ 
                         display: 'flex', 
                         gap: { xs: 0.5, sm: 1 }, 
                         flexWrap: 'wrap',
                         mt: 'auto'
                       }}>
                         {/* Botón del grupo familiar */}
                         <Button
                           variant="outlined"
                           size="small"
                           sx={{
                             backgroundColor: 'transparent',
                             borderColor: getGrupoFamiliarColor(afiliado.grupoFamiliar),
                             color: getGrupoFamiliarColor(afiliado.grupoFamiliar),
                             fontWeight: 'bold',
                             fontSize: { xs: '0.75rem', sm: '0.875rem' },
                             height: { xs: 24, sm: 28 },
                             textTransform: 'none',
                             minWidth: 'fit-content',
                             px: { xs: 0.5, sm: 1 },
                             '&:hover': {
                               backgroundColor: getGrupoFamiliarColor(afiliado.grupoFamiliar),
                               color: 'white'
                             }
                           }}
                         >
                           {afiliado.grupoFamiliar}
                         </Button>
                         
                         {/* Botones de información adicional */}
                         {afiliado.infoAdicional.map((info, index) => (
                           <Button
                             key={index}
                             variant="outlined"
                             size="small"
                             sx={{
                               backgroundColor: 'transparent',
                               borderColor: getInfoAdicionalColor(info),
                               color: getInfoAdicionalColor(info),
                               fontWeight: 'bold',
                               fontSize: { xs: '0.75rem', sm: '0.875rem' },
                               height: { xs: 24, sm: 28 },
                               textTransform: 'none',
                               minWidth: 'fit-content',
                               px: { xs: 0.5, sm: 1 },
                               '&:hover': {
                                 backgroundColor: getInfoAdicionalColor(info),
                                 color: 'white'
                               }
                             }}
                           >
                             {info}
                           </Button>
                         ))}
                       </Box>
                     </Box>
                   </Grid>

                   {/* Columna de botones de acción */}
                   <Grid item xs={12} lg={4} md={5}>
                     <Box sx={{ 
                       display: 'flex', 
                       flexDirection: { xs: 'row', sm: 'column' },
                       gap: { xs: 1, sm: 1.5 }, 
                       justifyContent: { xs: 'center', sm: 'center' }, 
                       alignItems: { xs: 'center', sm: 'flex-end' }, 
                       height: '100%',
                       flexWrap: 'wrap'
                     }}>
                       {/* Botón VER */}
                       <Button
                         variant="outlined"
                         size="small"
                         startIcon={<VisibilityIcon />}
                         sx={{
                           borderColor: '#2196f3',
                           color: '#2196f3',
                           backgroundColor: '#e3f2fd',
                           '&:hover': {
                             borderColor: '#1976d2',
                             backgroundColor: '#bbdefb'
                           },
                           fontWeight: 'bold',
                           fontSize: { xs: '0.7rem', sm: '0.75rem' },
                           height: { xs: 28, sm: 32 },
                           textTransform: 'none',
                           minWidth: { xs: 60, sm: 80 },
                           px: { xs: 0.5, sm: 1 },
                           flexShrink: 0
                         }}
                       >
                         VER
                       </Button>
                       
                       {/* Botón EDITAR */}
                       <Button
                         variant="outlined"
                         size="small"
                         startIcon={<EditIcon />}
                         sx={{
                           borderColor: '#2196f3',
                           color: '#2196f3',
                           backgroundColor: '#e3f2fd',
                           '&:hover': {
                             borderColor: '#1976d2',
                             backgroundColor: '#bbdefb'
                           },
                           fontWeight: 'bold',
                           fontSize: { xs: '0.7rem', sm: '0.75rem' },
                           height: { xs: 28, sm: 32 },
                           textTransform: 'none',
                           minWidth: { xs: 60, sm: 80 },
                           px: { xs: 0.5, sm: 1 },
                           flexShrink: 0
                         }}
                       >
                         EDITAR
                       </Button>
                       
                       {/* Botón DAR DE BAJA/REHABILITAR */}
                       <Button
                         variant="outlined"
                         size="small"
                         startIcon={<PowerSettingsNewIcon />}
                         onClick={() => handleCambiarEstado(afiliado.id)}
                         sx={{
                           borderColor: afiliado.estado === 'Activo' ? '#f44336' : '#4caf50',
                           color: afiliado.estado === 'Activo' ? '#f44336' : '#4caf50',
                           backgroundColor: afiliado.estado === 'Activo' ? '#ffebee' : '#e8f5e8',
                           '&:hover': {
                             borderColor: afiliado.estado === 'Activo' ? '#d32f2f' : '#45a049',
                             backgroundColor: afiliado.estado === 'Activo' ? '#ffcdd2' : '#c8e6c9'
                           },
                           fontWeight: 'bold',
                           fontSize: { xs: '0.7rem', sm: '0.75rem' },
                           height: { xs: 28, sm: 32 },
                           textTransform: 'none',
                           minWidth: { xs: 60, sm: 80 },
                           px: { xs: 0.5, sm: 1 },
                           flexShrink: 0
                         }}
                       >
                         {afiliado.estado === 'Activo' ? 'DAR DE BAJA' : 'REHABILITAR'}
                       </Button>
                     </Box>
                   </Grid>
                 </Grid>
              </CardContent>
            </Card>
            
                         {/* Separador entre afiliados */}
             {index < afiliados.length - 1 && (
               <Divider sx={{ my: { xs: 2, sm: 3 }, opacity: 0.6 }} />
             )}
           </Box>
         ))}
       </Box>

       {/* Botón flotante para agregar */}
       <Fab
         color="primary"
         aria-label="add"
         sx={{
           position: 'fixed',
           bottom: { xs: 16, sm: 24 },
           right: { xs: 16, sm: 24 },
           backgroundColor: '#2196f3',
           '&:hover': { backgroundColor: '#1976d2' },
           width: { xs: 48, sm: 56 },
           height: { xs: 48, sm: 56 }
         }}
       >
         <AddIcon />
       </Fab>
    </Box>
  );
}

export default Afiliados;