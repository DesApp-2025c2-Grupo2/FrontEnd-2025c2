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
  Person as PersonIcon, // Ícono de persona
  Add as AddIcon // Ícono de agregar
} from '@mui/icons-material';

function Prestadores() { // Componente principal
  const [searchTerm, setSearchTerm] = useState(''); // Estado de búsqueda

  // Array de prestadores con estado controlado
  const [prestadores, setPrestadores] = useState([
    {
      id: 1, // ID único
      nombre: 'Dra. Tita Merello', // Nombre del prestador
      tipo: 'Profesional Independiente', // Tipo de prestador
      estado: 'Activo', // Estado actual
      cuit: '20-12345678-9', // CUIT/CUIL
      direcciones: 1, // Cantidad de direcciones
      especialidades: ['Cardiología', 'Medicina General'] // Especialidades
    },
    {
      id: 2,
      nombre: 'Dr. Carlos Mendez',
      tipo: 'Profesional Independiente',
      estado: 'Activo',
      cuit: '20-98765432-1',
      direcciones: 1,
      especialidades: ['Traumatología']
    },
    {
      id: 3,
      nombre: 'Centro Médico San Juan',
      tipo: 'Centro Médico',
      estado: 'Activo',
      cuit: '30-11223344-5',
      direcciones: 1,
      especialidades: ['Múltiples']
    }
  ]);

  // Función para cambiar el estado del prestador
  const handleCambiarEstado = (id) => {
    setPrestadores(prevPrestadores =>
      prevPrestadores.map(prestador =>
        prestador.id === id
          ? {
              ...prestador,
              estado: prestador.estado === 'Activo' ? 'Inactivo' : 'Activo'
            }
          : prestador
      )
    );
  };

  // Función que retorna el color según el tipo
  const getTipoColor = (tipo) => {
    const tipoColors = {
      'Profesional Independiente': '#2196f3', // Azul para profesionales
      'Centro Médico': '#9c27b0' // Morado para centros
    };
    return tipoColors[tipo] || '#2196f3';
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

  // Función que retorna el color según la especialidad
  const getEspecialidadColor = (especialidad) => {
    const especialidadColors = {
      'Cardiología': '#e3f2fd', // Azul claro
      'Traumatología': '#f3e5f5', // Morado claro
      'Medicina General': '#e8f5e8', // Verde claro
      'Múltiples': '#fff3e0' // Naranja claro
    };
    return especialidadColors[especialidad] || '#e3f2fd';
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
        Prestadores {/* Título principal */}
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
        Gestión de prestadores médicos y centros de salud {/* Subtítulo */}
      </Typography>

      {/* Campo de búsqueda */}
      <TextField
        fullWidth // Ocupa todo el ancho
        variant="outlined" // Variante con borde
        placeholder="Buscar por nombre, CUIT/CUIL, especialidad o tipo..." // Texto de ayuda
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

      {/* Lista de prestadores */}
      <Box sx={{ mb: 4 }}>
        {prestadores.map((prestador, index) => (
          <Box key={prestador.id}>
            <Card 
              elevation={1} // Sombra sutil
              sx={{
                mb: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                backgroundColor: prestador.estado === 'Inactivo' ? '#f5f5f5' : 'white', // Fondo gris si está inactivo
                opacity: prestador.estado === 'Inactivo' ? 0.8 : 1, // Opacidad reducida si está inactivo
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
                          {prestador.nombre}
                        </Typography>
                      </Box>
                      
                      {/* Chips de tipo y estado */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: { xs: 1, sm: 1.5 }, 
                        mb: { xs: 1.5, sm: 2 },
                        flexWrap: 'wrap'
                      }}>
                        <Chip
                          label={prestador.tipo}
                          size="small"
                          sx={{
                            backgroundColor: getTipoColor(prestador.tipo),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            height: { xs: 24, sm: 28 }
                          }}
                        />
                        <Chip
                          label={prestador.estado}
                          size="small"
                          sx={{
                            backgroundColor: getEstadoColor(prestador.estado),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            height: { xs: 24, sm: 28 }
                          }}
                        />
                      </Box>
                      
                      {/* Detalles del prestador */}
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
                          <strong>CUIT/CUIL:</strong> {prestador.cuit}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          wordBreak: 'break-word'
                        }}>
                          <strong>Direcciones:</strong> {prestador.direcciones}
                        </Typography>
                      </Box>
                      
                      {/* Especialidades */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: { xs: 0.5, sm: 1 }, 
                        flexWrap: 'wrap',
                        mt: 'auto'
                      }}>
                        {prestador.especialidades.map((especialidad, idx) => (
                          <Chip
                            key={idx}
                            label={especialidad}
                            size="small"
                            sx={{
                              backgroundColor: getEspecialidadColor(especialidad),
                              color: 'text.primary',
                              fontWeight: 'bold',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              height: { xs: 24, sm: 28 }
                            }}
                          />
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
                        onClick={() => handleCambiarEstado(prestador.id)}
                        sx={{
                          borderColor: prestador.estado === 'Activo' ? '#f44336' : '#4caf50',
                          color: prestador.estado === 'Activo' ? '#f44336' : '#4caf50',
                          backgroundColor: prestador.estado === 'Activo' ? '#ffebee' : '#e8f5e8',
                          '&:hover': {
                            borderColor: prestador.estado === 'Activo' ? '#d32f2f' : '#45a049',
                            backgroundColor: prestador.estado === 'Activo' ? '#ffcdd2' : '#c8e6c9'
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
                        {prestador.estado === 'Activo' ? 'DAR DE BAJA' : 'REHABILITAR'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Separador entre prestadores */}
            {index < prestadores.length - 1 && (
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

export default Prestadores;