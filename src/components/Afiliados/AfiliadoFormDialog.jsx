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
  editTelefonos,
  editEmails,
  editDirecciones,
  newTelefono,
  newEmail,
  newDireccion,
  onClose,
  onSave,
  onEdit,
  onFormChange,
  onNewTelefonoChange,
  onNewEmailChange,
  onNewDireccionChange,
  onAddTelefono,
  onAddEmail,
  onAddDireccion,
  onRemoveTelefono,
  onRemoveEmail,
  onRemoveDireccion,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedAfiliado
          ? isEditing
            ? "Editar Afiliado"
            : "Detalle del Afiliado"
          : "Nuevo Afiliado Titular"}
      </DialogTitle>
      <DialogContent>
        {selectedAfiliado && !isEditing ? (
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedAfiliado.apellido}, {selectedAfiliado.nombre}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Credencial:</strong> {selectedAfiliado.numeroAfiliado}-
              {selectedAfiliado.numeroIntegrante}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Tipo y Nº de Documento:</strong>{" "}
              {selectedAfiliado.tipoDocumento}{" "}
              {selectedAfiliado.numeroDocumento}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Fecha de Nacimiento:</strong>{" "}
              {new Date(selectedAfiliado.fechaNacimiento).toLocaleDateString(
                "es-AR"
              )}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Fecha de Alta:</strong>{" "}
              {new Date(selectedAfiliado.fechaAlta).toLocaleDateString("es-AR")}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Parentesco:</strong> {selectedAfiliado.parentesco}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Plan Médico:</strong> {selectedAfiliado.planMedico}
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
                {selectedAfiliado.telefonos.map((telefono, index) => (
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
                {selectedAfiliado.emails.map((email, index) => (
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
                {selectedAfiliado.direcciones.map((direccion, index) => (
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
          <Box sx={{ pt: 2 }}>
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
                  <InputLabel>Plan Médico</InputLabel>
                  <Select
                    value={formData.planMedico}
                    onChange={(e) => onFormChange("planMedico", e.target.value)}
                  >
                    <MenuItem value="Plan Bronce">Plan Bronce</MenuItem>
                    <MenuItem value="Plan Plata">Plan Plata</MenuItem>
                    <MenuItem value="Plan Oro">Plan Oro</MenuItem>
                    <MenuItem value="Plan Platino">Plan Platino</MenuItem>
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
                  onNewValueChange={onNewTelefonoChange}
                  onAdd={onAddTelefono}
                  onRemove={onRemoveTelefono}
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
                  onNewValueChange={onNewEmailChange}
                  onAdd={onAddEmail}
                  onRemove={onRemoveEmail}
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
                  onNewValueChange={onNewDireccionChange}
                  onAdd={onAddDireccion}
                  onRemove={onRemoveDireccion}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {selectedAfiliado && !isEditing ? "Cerrar" : "Cancelar"}
        </Button>
        {(!selectedAfiliado || isEditing) && (
          <Button variant="contained" color="primary" onClick={onSave}>
            {selectedAfiliado ? "Guardar Cambios" : "Crear Afiliado"}
          </Button>
        )}
        {selectedAfiliado && !isEditing && (
          <Button variant="contained" color="primary" onClick={onEdit}>
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
