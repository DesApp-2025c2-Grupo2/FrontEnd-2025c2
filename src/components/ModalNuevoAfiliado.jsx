import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const ModalNuevoAfiliado = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: '',
    numeroDocumento: '',
    fechaNacimiento: '',
    telefonos: [],
    emails: [],
    direcciones: []
  });

  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio';
    if (!formData.tipoDocumento) newErrors.tipoDocumento = 'El tipo de documento es obligatorio';
    if (!formData.numeroDocumento.trim()) newErrors.numeroDocumento = 'El número de documento es obligatorio';
    if (!formData.fechaNacimiento.trim()) newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Generar credencial automáticamente
    const nuevoId = Date.now(); // ID temporal
    const nroAfiliado = String(nuevoId).slice(-7).padStart(7, '0');
    const nroIntegrante = '01'; // Siempre 01 para titulares

    const nuevoAfiliado = {
      id: nuevoId,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      nombreCompleto: `${formData.apellido.trim()}, ${formData.nombre.trim()}`,
      credencial: `${nroAfiliado}-${nroIntegrante}`,
      nroAfiliado,
      nroIntegrante,
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento.trim(),
      fechaNacimiento: formData.fechaNacimiento,
      parentesco: 'Titular',
      plan: 'Plan 310', // Plan por defecto
      estado: 'Activo',
      grupoFamiliar: nroAfiliado,
      alta: new Date().toLocaleDateString('es-AR'),
      telefonos: formData.telefonos,
      emails: formData.emails,
      direcciones: formData.direcciones,
      situacionesTerapeuticas: []
    };

    onSave(nuevoAfiliado);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      apellido: '',
      tipoDocumento: '',
      numeroDocumento: '',
      fechaNacimiento: '',
      telefonos: [],
      emails: [],
      direcciones: []
    });
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#333' }}>
          Nuevo Afiliado Titular
        </Typography>
        <Alert severity="info" sx={{ mt: 2, fontSize: '0.875rem' }}>
          Nota: Solo se pueden crear afiliados titulares. Para agregar integrantes a un grupo familiar, usar la sección Grupos Familiares.
        </Alert>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Información básica */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <TextField
            label="Nombre"
            value={formData.nombre}
            onChange={handleInputChange('nombre')}
            fullWidth
            error={!!errors.nombre}
            helperText={errors.nombre}
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
            inputProps={{ sx: { fontWeight: 600 } }}
          />
          <TextField
            label="Apellido"
            value={formData.apellido}
            onChange={handleInputChange('apellido')}
            fullWidth
            error={!!errors.apellido}
            helperText={errors.apellido}
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
            inputProps={{ sx: { fontWeight: 600 } }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <FormControl fullWidth error={!!errors.tipoDocumento}>
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
            {errors.tipoDocumento && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.tipoDocumento}
              </Typography>
            )}
          </FormControl>
          <TextField
            label="Número de Documento"
            value={formData.numeroDocumento}
            onChange={handleInputChange('numeroDocumento')}
            fullWidth
            error={!!errors.numeroDocumento}
            helperText={errors.numeroDocumento}
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
            inputProps={{ sx: { fontWeight: 600 } }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 3 }}>
          <TextField
            label="Fecha de Nacimiento"
            value={formData.fechaNacimiento}
            onChange={handleInputChange('fechaNacimiento')}
            fullWidth
            placeholder="dd/mm/aaaa"
            error={!!errors.fechaNacimiento}
            helperText={errors.fechaNacimiento}
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
            inputProps={{ sx: { fontWeight: 600 } }}
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
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} sx={{ fontWeight: 'bold' }}>
          CANCELAR
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSave}
          sx={{ fontWeight: 'bold' }}
        >
          CREAR AFILIADO
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalNuevoAfiliado;
