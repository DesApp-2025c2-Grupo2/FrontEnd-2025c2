import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';

const ModalDetalleAfiliado = ({ open, onClose, afiliado, onEdit }) => {
  if (!afiliado) return null;

  const getParentescoColor = (parentesco) => {
    const colors = {
      'Titular': '#2196f3',
      'Cónyuge': '#4caf50',
      'Hijo': '#2196f3',
      'Hija': '#2196f3'
    };
    return colors[parentesco] || '#2196f3';
  };

  const getSituacionColor = (situacion) => {
    const colors = {
      'Embarazo': '#ff9800',
      'Diabetes': '#ff9800'
    };
    return colors[situacion] || '#ff9800';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#333' }}>
          Detalle del Afiliado
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Información principal */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
            {afiliado.nombreCompleto}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
              <strong>Credencial:</strong> {afiliado.credencial}
            </Typography>
            <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
              <strong>Tipo y Nº de Documento:</strong> {afiliado.tipoDocumento} {afiliado.numeroDocumento}
            </Typography>
            <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
              <strong>Fecha de Nacimiento:</strong> {afiliado.fechaNacimiento}
            </Typography>
            <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
              <strong>Parentesco:</strong> {afiliado.parentesco}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Teléfonos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333', display: 'flex', alignItems: 'center' }}>
            <PhoneIcon sx={{ mr: 1, color: '#2196f3' }} />
            Teléfonos
          </Typography>
          <List dense>
            {afiliado.telefonos.map((telefono, index) => (
              <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <PhoneIcon sx={{ color: '#2196f3', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={telefono}
                  sx={{ '& .MuiListItemText-primary': { fontWeight: 500 } }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Emails */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333', display: 'flex', alignItems: 'center' }}>
            <EmailIcon sx={{ mr: 1, color: '#2196f3' }} />
            Emails
          </Typography>
          <List dense>
            {afiliado.emails.map((email, index) => (
              <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <EmailIcon sx={{ color: '#2196f3', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={email}
                  sx={{ '& .MuiListItemText-primary': { fontWeight: 500 } }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Direcciones */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333', display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 1, color: '#2196f3' }} />
            Direcciones
          </Typography>
          <List dense>
            {afiliado.direcciones.map((direccion, index) => (
              <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <LocationIcon sx={{ color: '#2196f3', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={direccion}
                  sx={{ '& .MuiListItemText-primary': { fontWeight: 500 } }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Situaciones Terapéuticas */}
        {afiliado.situacionesTerapeuticas.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333', display: 'flex', alignItems: 'center' }}>
              <HospitalIcon sx={{ mr: 1, color: '#2196f3' }} />
              Situaciones Terapéuticas
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {afiliado.situacionesTerapeuticas.map((situacion, index) => (
                <Chip
                  key={index}
                  label={situacion}
                  sx={{
                    backgroundColor: getSituacionColor(situacion),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Plan Médico */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
            Plan Médico
          </Typography>
          <Chip 
            label={afiliado.plan}
            color="primary"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 'bold' }}>
          CERRAR
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => onEdit && onEdit(afiliado)}
          sx={{ fontWeight: 'bold' }}
        >
          EDITAR
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDetalleAfiliado;
