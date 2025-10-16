// src/components/Afiliados/PersonaFormDialog.jsx
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
import SituacionesSelector from "./SituacionesSelector";
import { selectSituaciones } from "../../store/situacionesTerapeuticasSlice";
import { useSelector } from "react-redux";
import { tiposDocumento } from "../../utilidades/tipoDocumento";
import { parentescos, getParentescoNombre } from "../../utilidades/parentesco";

const hoyISO = () => new Date().toISOString().split("T")[0];
const padNumeroAfiliado = (n) => String(Number(n) || 0).padStart(7, "0");
const padIntegrante = (n) => String(Number(n) || 0).padStart(2, "0");

export default function PersonaFormDialog({
  open,
  selectedAfiliado,
  selectedFamiliar,
  isEditing = false,
  formData = {},
  editTelefonos = [],
  editEmails = [],
  editDirecciones = [],
  editSituaciones = [],
  onEditTelefonosChange = () => {},
  onEditEmailsChange = () => {},
  onEditDireccionesChange = () => {},
  onEditSituacionesChange = () => {},
  onClose = () => {},
  onSave = () => {},
  onFormChange = () => {},
}) {
  console.log("PROPS RECIBIDAS:", {
    selectedFamiliar,
    isEditing,
    formData,
    open,
  });
  const situacionesCatalogo = useSelector(selectSituaciones) || [];

  const [newTelefono, setNewTelefono] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDireccion, setNewDireccion] = useState("");

  const isViewMode = !!selectedFamiliar && !isEditing;

  // Helpers para normalizar valores
  const telefonoToString = (t) => {
    if (!t) return "";
    if (typeof t === "object") return t.numero ?? t.Numero ?? "";
    return String(t);
  };

  const emailToString = (e) => {
    if (!e) return "";
    if (typeof e === "object") return e.correo ?? e.Correo ?? "";
    return String(e);
  };

  const direccionToString = (d) => {
    if (!d) return "";
    if (typeof d === "object") {
      const altura = d.altura ? ` ${d.altura}` : "";
      const piso = d.piso ? `, Piso ${d.piso}` : "";
      const dept = d.departamento ? `, Dept ${d.departamento}` : "";
      const provincia = d.provinciaCiudad ?? "";
      const calle = d.calle ?? "";
      return `${calle}${altura}${piso}${dept}${
        provincia ? `, ${provincia}` : ""
      }`.trim();
    }
    return String(d);
  };

  // Función para obtener el valor inicial del formulario
  const getInitialFormData = () => {
    if (selectedFamiliar && isEditing) {
      return {
        nombre: selectedFamiliar.nombre || "",
        apellido: selectedFamiliar.apellido || "",
        tipoDocumento:
          selectedFamiliar.documentacion?.tipoDocumento ??
          selectedFamiliar.tipoDocumento ??
          "",
        numeroDocumento:
          selectedFamiliar.documentacion?.numero ??
          selectedFamiliar.numeroDocumento ??
          "",
        fechaNacimiento: selectedFamiliar.fechaNacimiento || hoyISO(),
        alta: selectedFamiliar.alta || hoyISO(),
        parentesco: selectedFamiliar.parentesco || "",
      };
    }
    return formData;
  };

  useEffect(() => {
    if (open) {
      setNewTelefono("");
      setNewEmail("");
      setNewDireccion("");

      // Inicializar datos del formulario cuando se abre en modo edición
      if (selectedFamiliar && isEditing) {
        const initialData = getInitialFormData();
        Object.entries(initialData).forEach(([key, value]) => {
          if (value !== undefined) {
            onFormChange(key, value);
          }
        });

        // Inicializar contactos usando los helpers
        if (selectedFamiliar.telefonos) {
          const telefonosNormalizados =
            selectedFamiliar.telefonos.map(telefonoToString);
          onEditTelefonosChange(telefonosNormalizados);
        }

        if (selectedFamiliar.emails) {
          const emailsNormalizados = selectedFamiliar.emails.map(emailToString);
          onEditEmailsChange(emailsNormalizados);
        }

        if (selectedFamiliar.direcciones) {
          // Para direcciones mantenemos los objetos completos
          onEditDireccionesChange(selectedFamiliar.direcciones);
        }

        if (selectedFamiliar.situacionesTerapeuticas) {
          onEditSituacionesChange(selectedFamiliar.situacionesTerapeuticas);
        }
      }
    }
  }, [open, selectedFamiliar, isEditing]);

  const handleAddTelefono = () => {
    if (!newTelefono.trim()) return;
    onEditTelefonosChange([...(editTelefonos || []), newTelefono.trim()]);
    setNewTelefono("");
  };

  const handleRemoveTelefono = (index) =>
    onEditTelefonosChange((editTelefonos || []).filter((_, i) => i !== index));

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    onEditEmailsChange([...(editEmails || []), newEmail.trim()]);
    setNewEmail("");
  };

  const handleRemoveEmail = (index) =>
    onEditEmailsChange((editEmails || []).filter((_, i) => i !== index));

  const handleAddDireccion = () => {
    if (!newDireccion.trim()) return;
    // Si el caller ya maneja objetos, permitimos pasar strings o objetos.
    const parsed =
      typeof newDireccion === "string"
        ? {
            calle: newDireccion.trim(),
            altura: "",
            piso: "",
            departamento: "",
            provinciaCiudad: "",
          }
        : newDireccion;
    onEditDireccionesChange([...(editDirecciones || []), parsed]);
    setNewDireccion("");
  };

  const handleRemoveDireccion = (index) =>
    onEditDireccionesChange(
      (editDirecciones || []).filter((_, i) => i !== index)
    );

  const handleFormChange = (field, value) => onFormChange(field, value);

  const handleParentescoChange = (e) =>
    handleFormChange("parentesco", Number(e.target.value));

  const handleTipoDocumentoChange = (e) =>
    handleFormChange("tipoDocumento", e.target.value);

  // Validación mínima local
  const validateBeforeSave = () => {
    if (!formData.nombre || !formData.apellido) {
      return { isValid: false, message: "Nombre y apellido son requeridos" };
    }
    if (!formData.tipoDocumento || !formData.numeroDocumento) {
      return {
        isValid: false,
        message: "Tipo y número de documento son requeridos",
      };
    }
    if (!formData.fechaNacimiento) {
      return { isValid: false, message: "Fecha de nacimiento es requerida" };
    }
    if (!formData.parentesco) {
      return { isValid: false, message: "Parentesco es requerido" };
    }
    return { isValid: true };
  };

  const handleSaveClick = () => {
    const validation = validateBeforeSave();
    if (!validation.isValid) {
      // Podrías mostrar un snackbar aquí o manejar el error de otra forma
      console.warn(validation.message);
      return;
    }
    onSave();
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
              <strong>Documento:</strong>{" "}
              {tiposDocumento[selectedFamiliar.documentacion.tipoDocumento] ||
                "Tipo desconocido"}{" "}
              {selectedFamiliar.documentacion.numero}
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
              {selectedFamiliar.fechaNacimiento
                ? new Date(selectedFamiliar.fechaNacimiento).toLocaleDateString(
                    "es-AR"
                  )
                : ""}
            </Typography>

            <Typography variant="body2" gutterBottom>
              <strong>Fecha de Alta:</strong>{" "}
              {selectedFamiliar.alta
                ? new Date(selectedFamiliar.alta).toLocaleDateString("es-AR")
                : ""}
            </Typography>

            {selectedFamiliar.baja && (
              <Typography variant="body2" gutterBottom>
                <strong>Fecha de Baja:</strong>{" "}
                {new Date(selectedFamiliar.baja).toLocaleDateString("es-AR")}
              </Typography>
            )}

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
                {(selectedFamiliar.telefonos || []).length > 0 ? (
                  (selectedFamiliar.telefonos || []).map((telefono, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <PhoneIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                      <Typography variant="body2">
                        {telefonoToString(telefono)}
                      </Typography>
                    </Box>
                  ))
                ) : (
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
                {(selectedFamiliar.emails || []).length > 0 ? (
                  (selectedFamiliar.emails || []).map((email, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <EmailIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                      <Typography variant="body2">
                        {emailToString(email)}
                      </Typography>
                    </Box>
                  ))
                ) : (
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
                {(selectedFamiliar.direcciones || []).length > 0 ? (
                  (selectedFamiliar.direcciones || []).map(
                    (direccion, index) => (
                      <Box
                        key={index}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <HomeIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        <Typography variant="body2">
                          {direccionToString(direccion)}
                        </Typography>
                      </Box>
                    )
                  )
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No hay direcciones registradas
                  </Typography>
                )}
              </Box>
            </Box>

            {(
              selectedFamiliar.situacionesTerapeuticas ||
              selectedFamiliar.situacionesTerapeuticasIds ||
              []
            ).length > 0 && (
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
                  {(
                    selectedFamiliar.situacionesTerapeuticas ||
                    selectedFamiliar.situacionesTerapeuticasIds ||
                    []
                  ).map((s, i) => (
                    <Typography key={i} variant="body2">
                      • {typeof s === "string" ? s : s?.nombre ?? String(s)}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
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
                    <MenuItem value="">Seleccione</MenuItem>
                    {Object.entries(tiposDocumento).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
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
                  value={
                    formData.fechaNacimiento
                      ? new Date(formData.fechaNacimiento)
                          .toISOString()
                          .split("T")[0]
                      : hoyISO()
                  }
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
                      : hoyISO()
                  }
                  onChange={(e) => handleFormChange("alta", e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Parentesco</InputLabel>
                  <Select
                    value={formData.parentesco ?? ""}
                    label="Parentesco"
                    onChange={handleParentescoChange}
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {parentescos
                      .filter((p) => p.id !== 1) // Excluir Titular
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
                  items={(editTelefonos || []).map(telefonoToString)}
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
                  items={(editEmails || []).map(emailToString)}
                  newValue={newEmail}
                  placeholder="Agregar email"
                  inputType="email"
                  onNewValueChange={setNewEmail}
                  onAdd={handleAddEmail}
                  onRemove={handleRemoveEmail}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <ContactInfoEditor
                  icon={<HomeIcon sx={{ mr: 1, color: "#1976d2" }} />}
                  title="Direcciones"
                  items={(editDirecciones || []).map(direccionToString)}
                  newValue={newDireccion}
                  placeholder="Agregar dirección"
                  onNewValueChange={setNewDireccion}
                  onAdd={handleAddDireccion}
                  onRemove={handleRemoveDireccion}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <SituacionesSelector
                  items={editSituaciones || []}
                  opciones={situacionesCatalogo}
                  onAdd={(nombre) =>
                    onEditSituacionesChange([
                      ...(editSituaciones || []),
                      nombre,
                    ])
                  }
                  onRemove={(idx) =>
                    onEditSituacionesChange(
                      (editSituaciones || []).filter((_, i) => i !== idx)
                    )
                  }
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
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSaveClick}
          >
            {selectedFamiliar && isEditing
              ? "Guardar Cambios"
              : "Agregar Persona"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
