import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import SituacionesSelector from "./SituacionesSelector";
import {
  addTelefonoToPersona,
  removeTelefonoFromPersona,
  addEmailToPersona,
  removeEmailFromPersona,
  addDireccionToPersona,
  removeDireccionFromPersona,
  addSituacionTerapeuticaToPersona,
  removeSituacionTerapeuticaFromPersona,
} from "../../store/personasSlice";
import { selectSituaciones } from "../../store/situacionesTerapeuticasSlice";

const padNumeroAfiliado = (n) => String(Number(n) || 0).padStart(7, "0");
const padIntegrante = (n) => String(Number(n) || 0).padStart(2, "0");

export default function PersonaFormDialog({
  open,
  selectedAfiliado,
  selectedFamiliar,
  isEditing,
  formData,
  parentescos,
  editTelefonos,
  editEmails,
  editDirecciones,
  editSituaciones,
  onEditTelefonosChange,
  onEditEmailsChange,
  onEditDireccionesChange,
  onEditSituacionesChange,
  onClose,
  onSave,
  onFormChange,
}) {
  const dispatch = useDispatch();
  const situacionesCatalogo = useSelector(selectSituaciones) || [];

  const [newTelefono, setNewTelefono] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDireccion, setNewDireccion] = useState("");

  const isViewMode = selectedFamiliar && !isEditing;

  useEffect(() => {
    if (open) {
      setNewTelefono("");
      setNewEmail("");
      setNewDireccion("");
    }
  }, [open]);

  const handleAddTelefono = () => {
    if (newTelefono.trim()) {
      const updatedTelefonos = [...editTelefonos, newTelefono.trim()];
      onEditTelefonosChange(updatedTelefonos);

      if (selectedFamiliar && isEditing) {
        dispatch(
          addTelefonoToPersona({
            personaId: selectedFamiliar.id,
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

    if (selectedFamiliar && isEditing) {
      dispatch(
        removeTelefonoFromPersona({
          personaId: selectedFamiliar.id,
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
          addEmailToPersona({
            personaId: selectedFamiliar.id,
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
        removeEmailFromPersona({
          personaId: selectedFamiliar.id,
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
          addDireccionToPersona({
            personaId: selectedFamiliar.id,
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
        removeDireccionFromPersona({
          personaId: selectedFamiliar.id,
          direccionIndex: index,
        })
      );
    }
  };

  const handleAddSituacion = (nombre) => {
    onEditSituacionesChange([...(editSituaciones || []), nombre]);
    if (selectedFamiliar && isEditing) {
      dispatch(
        addSituacionTerapeuticaToPersona({
          personaId: selectedFamiliar.id,
          situacion: nombre,
        })
      );
    }
  };

  const handleRemoveSituacion = (idx) => {
    onEditSituacionesChange(
      (editSituaciones || []).filter((_, i) => i !== idx)
    );
    if (selectedFamiliar && isEditing) {
      dispatch(
        removeSituacionTerapeuticaFromPersona({
          personaId: selectedFamiliar.id,
          situacionIndex: idx,
        })
      );
    }
  };

  const handleFormChange = (field, value) => onFormChange(field, value);
  const handleParentescoChange = (e) =>
    handleFormChange("parentesco", parseInt(e.target.value));
  const handleTipoDocumentoChange = (e) =>
    handleFormChange("tipoDocumento", e.target.value);

  const getParentescoNombre = (parentescoId) => {
    const parentesco = parentescos.find((p) => p.id === parentescoId);
    return parentesco ? parentesco.nombre : "Desconocido";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedFamiliar
          ? isEditing
            ? "Editar Persona"
            : "Detalle de la Persona"
          : "Agregar Persona al Grupo Familiar"}
      </DialogTitle>

      <DialogContent>
        {isViewMode ? (
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedFamiliar.apellido}, {selectedFamiliar.nombre}
            </Typography>

            <Typography variant="body2" gutterBottom>
              <strong>Credencial:</strong>{" "}
              {selectedAfiliado
                ? `${padNumeroAfiliado(
                    selectedAfiliado.numeroAfiliado
                  )}-${padIntegrante(selectedFamiliar.numeroIntegrante)}`
                : padIntegrante(selectedFamiliar.numeroIntegrante)}
            </Typography>

            <Typography variant="body2" gutterBottom>
              <strong>Documento:</strong> {selectedFamiliar.tipoDocumento}{" "}
              {selectedFamiliar.numeroDocumento}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Número de Integrante:</strong>{" "}
              {padIntegrante(selectedFamiliar.numeroIntegrante)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Parentesco:</strong>{" "}
              {getParentescoNombre(selectedFamiliar.parentesco)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Fecha de Nacimiento:</strong>{" "}
              {new Date(selectedFamiliar.fechaNacimiento).toLocaleDateString(
                "es-AR"
              )}
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
                {selectedFamiliar.telefonos?.length === 0 && (
                  <Typography variant="body2" color="textSecondary">
                    No hay teléfonos registrados
                  </Typography>
                )}
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
                {selectedFamiliar.emails?.length === 0 && (
                  <Typography variant="body2" color="textSecondary">
                    No hay emails registrados
                  </Typography>
                )}
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
                {selectedFamiliar.direcciones?.length === 0 && (
                  <Typography variant="body2" color="textSecondary">
                    No hay direcciones registradas
                  </Typography>
                )}
              </Box>
            </Box>

            {selectedFamiliar.situacionesTerapeuticas?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Situaciones Terapéuticas:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    ml: 2,
                  }}
                >
                  {selectedFamiliar.situacionesTerapeuticas.map((s, i) => (
                    <Typography key={i} variant="body2">
                      • {s}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            {/* Nota: NO mostramos el número de afiliado en creación/edición (requerido) */}

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre || ""}
                  onChange={(e) => handleFormChange("nombre", e.target.value)}
                  required
                  disabled={isViewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.apellido || ""}
                  onChange={(e) => handleFormChange("apellido", e.target.value)}
                  required
                  disabled={isViewMode}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isViewMode}>
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={isViewMode}>
                  <InputLabel>Parentesco</InputLabel>
                  <Select
                    value={formData.parentesco || ""}
                    label="Parentesco"
                    onChange={handleParentescoChange}
                  >
                    {parentescos
                      .filter((p) => p.id !== 1)
                      .map((parentesco) => (
                        <MenuItem key={parentesco.id} value={parentesco.id}>
                          {parentesco.nombre}
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12}>
                <SituacionesSelector
                  items={editSituaciones || []}
                  opciones={situacionesCatalogo}
                  onAdd={handleAddSituacion}
                  onRemove={handleRemoveSituacion}
                  disabled={isViewMode}
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
              : "Agregar Persona"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
