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
} from "@mui/material";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import ContactInfoEditor from "./ContactInfoEditor";

export default function FamiliarFormDialog({
  open,
  selectedAfiliado,
  selectedFamiliar,
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
        {selectedFamiliar && isEditing ? "Editar Familiar" : "Agregar Familiar"}
      </DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="secondary" onClick={onSave}>
          {selectedFamiliar && isEditing
            ? "Guardar Cambios"
            : "Agregar Familiar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
