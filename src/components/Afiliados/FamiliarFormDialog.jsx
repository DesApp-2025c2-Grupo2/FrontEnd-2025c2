import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import ContactInfoEditor from "./ContactInfoEditor";
import {
  addTelefonoToFamiliar,
  removeTelefonoFromFamiliar,
  addEmailToFamiliar,
  removeEmailFromFamiliar,
  addDireccionToFamiliar,
  removeDireccionFromFamiliar,
} from "../../store/familiaresSlice";

export default function FamiliarFormDialog({
  open,
  selectedAfiliado,
  selectedFamiliar,
  isEditing,
  formData,
  editTelefonos,
  editEmails,
  editDirecciones,
  onEditTelefonosChange,
  onEditEmailsChange,
  onEditDireccionesChange,
  onClose,
  onSave,
  onFormChange,
}) {
  const dispatch = useDispatch();

  // Estados locales solo para los inputs nuevos
  const [newTelefono, setNewTelefono] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDireccion, setNewDireccion] = useState("");

  // Determinar si estamos en modo vista (no editing y hay familiar seleccionado)
  const isViewMode = selectedFamiliar && !isEditing;

  // Limpiar inputs nuevos cuando se cierra/abre el diálogo
  useEffect(() => {
    setNewTelefono("");
    setNewEmail("");
    setNewDireccion("");
  }, [open]);

  const handleAddTelefono = () => {
    if (newTelefono.trim()) {
      const updatedTelefonos = [...editTelefonos, newTelefono.trim()];
      onEditTelefonosChange(updatedTelefonos);

      // Si estamos editando, actualizar en Redux
      if (selectedFamiliar && isEditing) {
        dispatch(
          addTelefonoToFamiliar({
            familiarId: selectedFamiliar.id,
            telefono: newTelefono.trim(),
          })
        );
      }
      setNewTelefono("");
    }
  };

  const handleRemoveTelefono = (index) => {
    const updatedTelefonos = editTelefonos.filter((_, i) => i !== index);
    onEditTelefonosChange(updatedTelefonos);

    // Si estamos editando, actualizar en Redux
    if (selectedFamiliar && isEditing) {
      dispatch(
        removeTelefonoFromFamiliar({
          familiarId: selectedFamiliar.id,
          telefonoIndex: index,
        })
      );
    }
  };

  const handleAddEmail = () => {
    if (newEmail.trim()) {
      const updatedEmails = [...editEmails, newEmail.trim()];
      onEditEmailsChange(updatedEmails);

      if (selectedFamiliar && isEditing) {
        dispatch(
          addEmailToFamiliar({
            familiarId: selectedFamiliar.id,
            email: newEmail.trim(),
          })
        );
      }
      setNewEmail("");
    }
  };

  const handleRemoveEmail = (index) => {
    const updatedEmails = editEmails.filter((_, i) => i !== index);
    onEditEmailsChange(updatedEmails);

    if (selectedFamiliar && isEditing) {
      dispatch(
        removeEmailFromFamiliar({
          familiarId: selectedFamiliar.id,
          emailIndex: index,
        })
      );
    }
  };

  const handleAddDireccion = () => {
    if (newDireccion.trim()) {
      const updatedDirecciones = [...editDirecciones, newDireccion.trim()];
      onEditDireccionesChange(updatedDirecciones);

      if (selectedFamiliar && isEditing) {
        dispatch(
          addDireccionToFamiliar({
            familiarId: selectedFamiliar.id,
            direccion: newDireccion.trim(),
          })
        );
      }
      setNewDireccion("");
    }
  };

  const handleRemoveDireccion = (index) => {
    const updatedDirecciones = editDirecciones.filter((_, i) => i !== index);
    onEditDireccionesChange(updatedDirecciones);

    if (selectedFamiliar && isEditing) {
      dispatch(
        removeDireccionFromFamiliar({
          familiarId: selectedFamiliar.id,
          direccionIndex: index,
        })
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedFamiliar
          ? isEditing
            ? "Editar Familiar"
            : "Detalle del Familiar"
          : "Agregar Familiar"}
      </DialogTitle>
      <DialogContent>
        {isViewMode ? (
          // MODO VISTA (SOLO LECTURA)
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedFamiliar.apellido}, {selectedFamiliar.nombre}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Credencial:</strong> {selectedFamiliar.numeroAfiliado}-
              {selectedFamiliar.numeroIntegrante}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Tipo y Nº de Documento:</strong>{" "}
              {selectedFamiliar.tipoDocumento}{" "}
              {selectedFamiliar.numeroDocumento}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Fecha de Nacimiento:</strong>{" "}
              {new Date(selectedFamiliar.fechaNacimiento).toLocaleDateString(
                "es-AR"
              )}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Fecha de Alta:</strong>{" "}
              {new Date(selectedFamiliar.fechaAlta).toLocaleDateString("es-AR")}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Parentesco:</strong> {selectedFamiliar.parentesco}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Plan Médico:</strong> {selectedFamiliar.planMedico}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Teléfonos:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  ml: 2,
                }}
              >
                {selectedFamiliar.telefonos?.map((telefono, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <PhoneIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                    <Typography variant="body2">{telefono}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Emails:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  ml: 2,
                }}
              >
                {selectedFamiliar.emails?.map((email, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <EmailIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                    <Typography variant="body2">{email}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Direcciones:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  ml: 2,
                }}
              >
                {selectedFamiliar.direcciones?.map((direccion, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <HomeIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                    <Typography variant="body2">{direccion}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          // MODO EDICIÓN/CREACIÓN
          <Box sx={{ pt: 2 }}>
            {selectedAfiliado && (
              <Typography
                variant="body2"
                color="textSecondary"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Grupo Familiar: {selectedAfiliado.apellido} - Credencial:{" "}
                {selectedAfiliado.numeroAfiliado}
              </Typography>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => onFormChange("nombre", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.apellido}
                  onChange={(e) => onFormChange("apellido", e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
                    value={formData.tipoDocumento}
                    onChange={(e) =>
                      onFormChange("tipoDocumento", e.target.value)
                    }
                  >
                    <MenuItem value="DNI">DNI</MenuItem>
                    <MenuItem value="LC">LC</MenuItem>
                    <MenuItem value="LE">LE</MenuItem>
                    <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Número de Documento"
                  value={formData.numeroDocumento}
                  onChange={(e) =>
                    onFormChange("numeroDocumento", e.target.value)
                  }
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.fechaNacimiento}
                  onChange={(e) =>
                    onFormChange("fechaNacimiento", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha de Alta"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.fechaAlta}
                  onChange={(e) => onFormChange("fechaAlta", e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Parentesco</InputLabel>
                  <Select
                    value={formData.parentesco}
                    onChange={(e) => onFormChange("parentesco", e.target.value)}
                  >
                    <MenuItem value="Cónyuge">Cónyuge</MenuItem>
                    <MenuItem value="Hijo">Hijo</MenuItem>
                    <MenuItem value="ACargo">A Cargo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <ContactInfoEditor
                  icon={<PhoneIcon sx={{ mr: 1, color: "#1976d2" }} />}
                  title="Teléfonos"
                  items={editTelefonos}
                  newValue={newTelefono}
                  placeholder="Agregar teléfono"
                  onNewValueChange={setNewTelefono}
                  onAdd={handleAddTelefono}
                  onRemove={handleRemoveTelefono}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <ContactInfoEditor
                  icon={<EmailIcon sx={{ mr: 1, color: "#1976d2" }} />}
                  title="Emails"
                  items={editEmails}
                  newValue={newEmail}
                  placeholder="Agregar email"
                  inputType="email"
                  onNewValueChange={setNewEmail}
                  onAdd={handleAddEmail}
                  onRemove={handleRemoveEmail}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ContactInfoEditor
                  icon={<HomeIcon sx={{ mr: 1, color: "#1976d2" }} />}
                  title="Direcciones"
                  items={editDirecciones}
                  newValue={newDireccion}
                  placeholder="Agregar dirección"
                  onNewValueChange={setNewDireccion}
                  onAdd={handleAddDireccion}
                  onRemove={handleRemoveDireccion}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          {isViewMode ? "Cerrar" : "Cancelar"}
        </Button>
        {!isViewMode && (
          <Button variant="contained" color="secondary" onClick={onSave}>
            {selectedFamiliar && isEditing
              ? "Guardar Cambios"
              : "Agregar Familiar"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
