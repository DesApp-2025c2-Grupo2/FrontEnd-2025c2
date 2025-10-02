import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const ModalEditarAfiliado = ({ open, onClose, afiliado, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    fechaNacimiento: '',
    parentesco: 'Titular',
    plan: 'Plan 310',
    telefonos: [],
    emails: [],
    direcciones: []
  });

  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    if (afiliado) {
      setFormData({
        nombre: afiliado.nombre || '',
        apellido: afiliado.apellido || '',
        tipoDocumento: afiliado.tipoDocumento || 'DNI',
        numeroDocumento: afiliado.numeroDocumento || '',
        fechaNacimiento: afiliado.fechaNacimiento || '',
        parentesco: afiliado.parentesco || 'Titular',
        plan: afiliado.plan || 'Plan 310',
        telefonos: afiliado.telefonos || [],
        emails: afiliado.emails || [],
        direcciones: afiliado.direcciones || []
      });
    }
  }, [afiliado]);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const addPhone = () => {
    if (newPhone.trim()) {
      setFormData(prev => ({
        ...prev,
        telefonos: [...prev.telefonos, newPhone.trim()]
      }));
      setNewPhone('');
    }
  };

  const removePhone = (index) => {
    setFormData(prev => ({
      ...prev,
      telefonos: prev.telefonos.filter((_, i) => i !== index)
    }));
  };

  const addEmail = () => {
    if (newEmail.trim()) {
      setFormData(prev => ({
        ...prev,
        emails: [...prev.emails, newEmail.trim()]
      }));
      setNewEmail('');
    }
  };

  const removeEmail = (index) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const addAddress = () => {
    if (newAddress.trim()) {
      setFormData(prev => ({
        ...prev,
        direcciones: [...prev.direcciones, newAddress.trim()]
      }));
      setNewAddress('');
    }
  };

  const removeAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      direcciones: prev.direcciones.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const updatedAfiliado = {
      ...afiliado,
      ...formData,
      nombreCompleto: `${formData.apellido}, ${formData.nombre}`
    };
    onSave(updatedAfiliado);
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
          Editar Afiliado
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>
          Editar datos de {afiliado?.nombreCompleto}
        </Typography>
        {afiliado && (
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            Credencial: {afiliado.credencial}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Información básica */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <TextField
            label="Nombre"
            value={formData.nombre}
            onChange={handleInputChange('nombre')}
            fullWidth
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
            inputProps={{ sx: { fontWeight: 600 } }}
          />
          <TextField
            label="Apellido"
            value={formData.apellido}
            onChange={handleInputChange('apellido')}
            fullWidth
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
            inputProps={{ sx: { fontWeight: 600 } }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontWeight: 'bold' }}>Tipo de Documento</InputLabel>
            <Select
              value={formData.tipoDocumento}
              onChange={handleInputChange('tipoDocumento')}
              label="Tipo de Documento"
            >
              <MenuItem value="DNI">DNI</MenuItem>
              <MenuItem value="LC">LC</MenuItem>
              <MenuItem value="LE">LE</MenuItem>
              <MenuItem value="Pasaporte">Pasaporte</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Número de Documento"
            value={formData.numeroDocumento}
            onChange={handleInputChange('numeroDocumento')}
            fullWidth
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
            inputProps={{ sx: { fontWeight: 600 } }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <TextField
            label="Fecha de Nacimiento"
            value={formData.fechaNacimiento}
            onChange={handleInputChange('fechaNacimiento')}
            fullWidth
            placeholder="DD/MM/YYYY"
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
            inputProps={{ sx: { fontWeight: 600 } }}
          />
          <TextField
            label="Parentesco"
            value={formData.parentesco}
            fullWidth
            disabled
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
            inputProps={{ sx: { fontWeight: 600, color: '#666' } }}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#666',
              },
            }}
          />
        </Box>

        {/* Teléfonos */}
        <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333', display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1, color: '#2196f3' }} />
              Teléfonos
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                placeholder="Agregar teléfono"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                fullWidth
                size="small"
                onKeyPress={(e) => e.key === 'Enter' && addPhone()}
              />
              <IconButton 
                onClick={addPhone} 
                color="primary"
                disabled={!newPhone.trim()}
              >
                <AddIcon />
              </IconButton>
            </Box>

            <List dense>
              {formData.telefonos.map((telefono, index) => (
                <ListItem key={index} sx={{ py: 0.5, px: 0, backgroundColor: 'white', mb: 1, borderRadius: 1 }}>
                  <ListItemText primary={telefono} />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => removePhone(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Emails */}
        <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333', display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, color: '#2196f3' }} />
              Emails
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                placeholder="Agregar email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                fullWidth
                size="small"
                onKeyPress={(e) => e.key === 'Enter' && addEmail()}
              />
              <IconButton 
                onClick={addEmail} 
                color="primary"
                disabled={!newEmail.trim()}
              >
                <AddIcon />
              </IconButton>
            </Box>

            <List dense>
              {formData.emails.map((email, index) => (
                <ListItem key={index} sx={{ py: 0.5, px: 0, backgroundColor: 'white', mb: 1, borderRadius: 1 }}>
                  <ListItemText primary={email} />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => removeEmail(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Direcciones */}
        <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333', display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ mr: 1, color: '#2196f3' }} />
              Direcciones
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                placeholder="Agregar dirección"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                fullWidth
                size="small"
                onKeyPress={(e) => e.key === 'Enter' && addAddress()}
              />
              <IconButton 
                onClick={addAddress} 
                color="primary"
                disabled={!newAddress.trim()}
              >
                <AddIcon />
              </IconButton>
            </Box>

            <List dense>
              {formData.direcciones.map((direccion, index) => (
                <ListItem key={index} sx={{ py: 0.5, px: 0, backgroundColor: 'white', mb: 1, borderRadius: 1 }}>
                  <ListItemText primary={direccion} />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => removeAddress(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Plan Médico */}
        <TextField
          label="Plan Médico"
          value={formData.plan}
          fullWidth
          disabled
          InputLabelProps={{ sx: { fontWeight: 'bold' } }}
          inputProps={{ sx: { fontWeight: 600, color: '#666' } }}
          sx={{
            mb: 2,
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#666',
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 'bold' }}>
          CANCELAR
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSave}
          sx={{ fontWeight: 'bold' }}
        >
          GUARDAR CAMBIOS
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEditarAfiliado;
