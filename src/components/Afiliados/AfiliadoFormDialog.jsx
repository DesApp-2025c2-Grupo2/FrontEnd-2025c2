// AfiliadoFormDialog.jsx
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
import ContactInfoEditor from "../ContactInfoEditor";
import SituacionesSelector from "./SituacionesSelector";
import DireccionesEditor from "./DireccionesEditor";
import { tiposDocumento } from "../../utilidades/tipoDocumento";

const hoyISO = () => new Date().toISOString().split("T")[0];
const padNumeroAfiliado = (n) => String(Number(n) || 0).padStart(7, "0");
const padIntegrante = (n) => String(Number(n) || 0).padStart(2, "0");

export default function AfiliadoFormDialog({
  open,
  selectedAfiliado = null,
  isEditing = false,
  formData = {},
  planesMedicos = [],
  editTelefonos = [],
  situacionesCatalogo = [],
  editEmails = [],
  editDirecciones = [],
  editSituaciones = [],
  onEditTelefonosChange = () => {},
  onEditEmailsChange = () => {},
  onEditDireccionesChange = () => {},
  onEditSituacionesChange = () => {},
  onClose = () => {},
  onSave = () => {},
  onEdit = () => {},
  onFormChange = () => {},
  personas = [],
}) {
  const [newTelefono, setNewTelefono] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDireccion, setNewDireccion] = useState({
    calle: "",
    altura: "",
    piso: "",
    departamento: "",
    provinciaCiudad: "",
  });

  const getPlanMedicoNombre = (planMedicoId, planesMedicos) => {
    const plan = (planesMedicos || []).find(
      (p) => String(p.id) === String(planMedicoId)
    );
    return plan ? plan.nombre : "Desconocido";
  };

  const planMedico = selectedAfiliado
    ? getPlanMedicoNombre(selectedAfiliado.planMedicoId, planesMedicos)
    : null;

  useEffect(() => {
    if (open) {
      setNewTelefono("");
      setNewEmail("");
      setNewDireccion({
        calle: "",
        altura: "",
        piso: "",
        departamento: "",
        provinciaCiudad: "",
      });
    }
  }, [open]);

  const getTitularDelAfiliado = (af) => {
    if (!af) return null;
    const id = af.titularId ?? af.titularID;
    return personas.find((p) => String(p.id) === String(id)) ?? null;
  };

  const titular = selectedAfiliado
    ? getTitularDelAfiliado(selectedAfiliado)
    : null;

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

  const handleAddDireccion = (direccion) => {
    onEditDireccionesChange([...(editDirecciones || []), direccion]);
  };

  const handleRemoveDireccion = (index) => {
    onEditDireccionesChange(
      (editDirecciones || []).filter((_, i) => i !== index)
    );
  };

  const handleFormChange = (field, value) => onFormChange(field, value);

  const handlePlanMedicoChange = (e) =>
    handleFormChange("planMedicoId", e.target.value);

  const handleTipoDocumentoChange = (e) =>
    handleFormChange("tipoDocumento", e.target.value);

  const handleAddSituacion = (sit) => {
    const nuevas = [...(editSituaciones || []), sit];
    onEditSituacionesChange(nuevas);
  };

  const handleRemoveSituacion = (idx) => {
    const nuevas = (editSituaciones || []).filter((_, i) => i !== idx);
    onEditSituacionesChange(nuevas);
  };

  const handleUpdateSituacion = (idx, updated) => {
    const nuevas = [...(editSituaciones || [])];
    nuevas[idx] = updated;
    onEditSituacionesChange(nuevas);
  };

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
          <Box sx={{ pt: 2 }}>
            {titular ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {titular.apellido}, {titular.nombre}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Credencial:</strong>{" "}
                  {padNumeroAfiliado(selectedAfiliado.numeroAfiliado)}-
                  {padIntegrante(titular.numeroIntegrante)}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Documento:</strong>{" "}
                  {tiposDocumento[titular.documentacion.tipoDocumento] ||
                    "Tipo desconocido"}{" "}
                  {titular.documentacion.numero}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Plan Médico:</strong>{" "}
                  {planMedico || "Plan Desconocido"} {console.log(planMedico)}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Fecha de Nacimiento:</strong>{" "}
                  {titular.fechaNacimiento
                    ? new Date(titular.fechaNacimiento).toLocaleDateString(
                        "es-AR"
                      )
                    : ""}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Fecha de Alta:</strong>{" "}
                  {selectedAfiliado.alta
                    ? new Date(selectedAfiliado.alta).toLocaleDateString(
                        "es-AR"
                      )
                    : ""}
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
                    {(titular.telefonos || []).length ? (
                      (titular.telefonos || []).map((t, i) => (
                        <Box
                          key={i}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PhoneIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          <Typography variant="body2">{t.numero}</Typography>
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
                    {(titular.emails || []).length ? (
                      (titular.emails || []).map((e, i) => (
                        <Box
                          key={i}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <EmailIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          <Typography variant="body2">{e.correo}</Typography>
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
                    {(titular.direcciones || []).length ? (
                      (titular.direcciones || []).map((d, i) => (
                        <Box
                          key={i}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <HomeIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                          <Typography variant="body2">
                            {d.calle}, {d.altura}, Piso {d.piso}, Departamento{" "}
                            {d.departamento}, {d.provinciaCiudad}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No hay direcciones registradas
                      </Typography>
                    )}
                  </Box>
                </Box>

                {(titular.situacionesTerapeuticas || []).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
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
                      {(titular.situacionesTerapeuticas || []).map((s, i) => {
                        // s puede ser string, number o objeto {id,nombre,fechaFin}
                        const nombre =
                          typeof s === "string"
                            ? s
                            : s && s.nombre
                            ? s.nombre
                            : String(s);
                        const fechaFin =
                          s && (s.fechaFin || s.fechaFin === null)
                            ? s.fechaFin
                            : null;
                        return (
                          <Typography key={i} variant="body2">
                            • {nombre}
                            {fechaFin
                              ? ` — hasta: ${new Date(
                                  fechaFin
                                ).toLocaleDateString("es-AR")}`
                              : ""}
                          </Typography>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </>
            ) : (
              <Typography color="error">
                No se encontraron datos del titular
              </Typography>
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
                        {" "}
                        {/* ← Usar key (numérico) no value */}
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
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Plan Médico</InputLabel>
                  <Select
                    value={String(formData.planMedicoId ?? "")}
                    label="Plan Médico"
                    onChange={handlePlanMedicoChange}
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {(planesMedicos || []).map((plan) => (
                      <MenuItem key={plan.id} value={String(plan.id)}>
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
                  items={editTelefonos || []}
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
                  items={editEmails || []}
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
                <DireccionesEditor
                  items={editDirecciones || []}
                  newValue={newDireccion}
                  onNewValueChange={setNewDireccion}
                  onAdd={handleAddDireccion}
                  onRemove={handleRemoveDireccion}
                  disabled={false}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <SituacionesSelector
                  items={editSituaciones || []}
                  opciones={situacionesCatalogo}
                  onAdd={handleAddSituacion}
                  onRemove={handleRemoveSituacion}
                  onUpdate={handleUpdateSituacion}
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
