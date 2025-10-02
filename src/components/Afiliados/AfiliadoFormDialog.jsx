import { useState, useEffect } from "react";
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

export default function AfiliadoFormDialog({
  open,
  selectedAfiliado,
  isEditing,
  formData,
  planesMedicos,
  editTelefonos,
  editEmails,
  editDirecciones,
  onEditTelefonosChange,
  onEditEmailsChange,
  onEditDireccionesChange,
  onClose,
  onSave,
  onEdit,
  onFormChange,
  personas,
}) {
  const [newTelefono, setNewTelefono] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDireccion, setNewDireccion] = useState("");

  // Limpiar inputs nuevos cuando se cierra/abre el diálogo
  useEffect(() => {
    if (open) {
      setNewTelefono("");
      setNewEmail("");
      setNewDireccion("");
    }
  }, [open]);

  // Obtener el titular del afiliado
  const getTitularDelAfiliado = (afiliado) => {
    return personas.find((p) => p.id === afiliado.titularId);
  };

  const handleAddTelefono = () => {
    if (newTelefono.trim()) {
      const updatedTelefonos = [...editTelefonos, newTelefono.trim()];
      onEditTelefonosChange(updatedTelefonos);
      setNewTelefono("");
    }
  };

  const handleRemoveTelefono = (index) => {
    const updatedTelefonos = editTelefonos.filter((_, i) => i !== index);
    onEditTelefonosChange(updatedTelefonos);
  };

  const handleAddEmail = () => {
    if (newEmail.trim()) {
      const updatedEmails = [...editEmails, newEmail.trim()];
      onEditEmailsChange(updatedEmails);
      setNewEmail("");
    }
  };

  const handleRemoveEmail = (index) => {
    const updatedEmails = editEmails.filter((_, i) => i !== index);
    onEditEmailsChange(updatedEmails);
  };

  const handleAddDireccion = () => {
    if (newDireccion.trim()) {
      const updatedDirecciones = [...editDirecciones, newDireccion.trim()];
      onEditDireccionesChange(updatedDirecciones);
      setNewDireccion("");
    }
  };

  const handleRemoveDireccion = (index) => {
    const updatedDirecciones = editDirecciones.filter((_, i) => i !== index);
    onEditDireccionesChange(updatedDirecciones);
  };

  const getPlanMedicoNombre = (planMedicoId) => {
    const plan = planesMedicos.find((p) => p.id === planMedicoId);
    return plan ? plan.nombre : "Desconocido";
  };

  // Handler para cambios en el formulario - DIRECTO AL PADRE
  const handleFormChange = (field, value) => {
    onFormChange(field, value);
  };

  // Handler específico para plan médico
  const handlePlanMedicoChange = (e) => {
    const value = parseInt(e.target.value);
    handleFormChange("planMedicoId", value);
  };

  // Handler específico para tipo de documento
  const handleTipoDocumentoChange = (e) => {
    handleFormChange("tipoDocumento", e.target.value);
  };

  const titular = selectedAfiliado
    ? getTitularDelAfiliado(selectedAfiliado)
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedAfiliado
          ? isEditing
            ? "Editar Afiliado Titular"
            : "Detalle del Afiliado Titular"
          : "Nuevo Afiliado Titular"}
      </DialogTitle>
      <DialogContent>
        {selectedAfiliado && !isEditing ? (
          // MODO VISTA (SOLO LECTURA)
          <Box sx={{ pt: 2 }}>
            {titular ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {titular.apellido}, {titular.nombre}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Número de Afiliado:</strong>{" "}
                  {selectedAfiliado.numeroAfiliado}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Documento:</strong> {titular.tipoDocumento}{" "}
                  {titular.numeroDocumento}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Plan Médico:</strong>{" "}
                  {getPlanMedicoNombre(selectedAfiliado.planMedicoId)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Fecha de Nacimiento:</strong>{" "}
                  {new Date(titular.fechaNacimiento).toLocaleDateString(
                    "es-AR"
                  )}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Fecha de Alta:</strong>{" "}
                  {new Date(selectedAfiliado.alta).toLocaleDateString("es-AR", {
                    timeZone: "UTC",
                  })}
                </Typography>
                {selectedAfiliado.baja && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Fecha de Baja:</strong>{" "}
                    {new Date(selectedAfiliado.baja).toLocaleDateString(
                      "es-AR"
                    )}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
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
                    {titular.telefonos?.map((telefono, index) => (
                      <Box
                        key={index}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PhoneIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        <Typography variant="body2">{telefono}</Typography>
                      </Box>
                    ))}
                    {(!titular.telefonos || titular.telefonos.length === 0) && (
                      <Typography variant="body2" color="textSecondary">
                        No hay teléfonos registrados
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
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
                    {titular.emails?.map((email, index) => (
                      <Box
                        key={index}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <EmailIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        <Typography variant="body2">{email}</Typography>
                      </Box>
                    ))}
                    {(!titular.emails || titular.emails.length === 0) && (
                      <Typography variant="body2" color="textSecondary">
                        No hay emails registrados
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
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
                    {titular.direcciones?.map((direccion, index) => (
                      <Box
                        key={index}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <HomeIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        <Typography variant="body2">{direccion}</Typography>
                      </Box>
                    ))}
                    {(!titular.direcciones ||
                      titular.direcciones.length === 0) && (
                      <Typography variant="body2" color="textSecondary">
                        No hay direcciones registradas
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            ) : (
              <Typography color="error">
                No se encontraron datos del titular
              </Typography>
            )}
          </Box>
        ) : (
          // MODO EDICIÓN/CREACIÓN
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre || ""}
                  onChange={(e) => handleFormChange("nombre", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.apellido || ""}
                  onChange={(e) => handleFormChange("apellido", e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
                    value={formData.tipoDocumento || ""}
                    label="Tipo de Documento"
                    onChange={handleTipoDocumentoChange}
                  >
                    <MenuItem value="DNI">DNI</MenuItem>
                    <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Número de Documento"
                  value={formData.numeroDocumento || ""}
                  onChange={(e) =>
                    handleFormChange("numeroDocumento", e.target.value)
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
                  value={formData.fechaNacimiento || ""}
                  onChange={(e) =>
                    handleFormChange("fechaNacimiento", e.target.value)
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
                  value={
                    formData.alta
                      ? new Date(formData.alta).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleFormChange("alta", e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Plan Médico</InputLabel>
                  <Select
                    value={formData.planMedicoId || ""}
                    label="Plan Médico"
                    onChange={handlePlanMedicoChange}
                  >
                    {planesMedicos.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.nombre}
                      </MenuItem>
                    ))}
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
          {selectedAfiliado && !isEditing ? "Cerrar" : "Cancelar"}
        </Button>
        {(!selectedAfiliado || isEditing) && (
          <Button variant="contained" color="secondary" onClick={onSave}>
            {selectedAfiliado ? "Guardar Cambios" : "Crear Afiliado"}
          </Button>
        )}
        {selectedAfiliado && !isEditing && (
          <Button variant="contained" color="secondary" onClick={onEdit}>
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
