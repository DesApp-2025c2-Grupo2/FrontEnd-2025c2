import {
  Box,
  Typography,
  Card,
  TextField,
  IconButton,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

export default function DireccionesEditor({
  items = [],
  newValue = {
    calle: "",
    altura: "",
    piso: "",
    departamento: "",
    provinciaCiudad: "",
  },
  onNewValueChange = () => {},
  onAdd = () => {},
  onRemove = () => {},
  disabled = false,
}) {
  const list = Array.isArray(items) ? items : [];

  const handleAdd = () => {
    if (newValue.calle.trim()) {
      onAdd(newValue);
      onNewValueChange({
        calle: "",
        altura: "",
        piso: "",
        departamento: "",
        provinciaCiudad: "",
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!disabled) handleAdd();
    }
  };

  return (
    <Card sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <HomeIcon sx={{ mr: 1, color: "#1976d2" }} />
        <Typography variant="subtitle2">Direcciones</Typography>
      </Box>

      {/* Formulario para nueva dirección */}
      <Box sx={{ mb: 3, p: 2, border: "1px dashed #e0e0e0", borderRadius: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Agregar Nueva Dirección
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Calle"
              value={newValue.calle || ""}
              onChange={(e) =>
                onNewValueChange({ ...newValue, calle: e.target.value })
              }
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Altura"
              value={newValue.altura || ""}
              onChange={(e) =>
                onNewValueChange({ ...newValue, altura: e.target.value })
              }
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Piso"
              value={newValue.piso || ""}
              onChange={(e) =>
                onNewValueChange({ ...newValue, piso: e.target.value })
              }
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Dpto"
              value={newValue.departamento || ""}
              onChange={(e) =>
                onNewValueChange({ ...newValue, departamento: e.target.value })
              }
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Provincia/Ciudad"
              value={newValue.provinciaCiudad || ""}
              onChange={(e) =>
                onNewValueChange({
                  ...newValue,
                  provinciaCiudad: e.target.value,
                })
              }
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12}>
            <IconButton
              onClick={handleAdd}
              color="secondary"
              aria-label="Agregar dirección"
              disabled={disabled || !newValue.calle.trim()}
            >
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>

      {/* Lista de direcciones existentes */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {list.length === 0 && (
          <Typography variant="body2" color="textSecondary">
            No hay direcciones registradas
          </Typography>
        )}

        {list.map((direccion, index) => (
          <Card
            key={index}
            sx={{
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
            }}
            variant="outlined"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {direccion.calle} {direccion.altura}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {[
                    direccion.piso && `Piso ${direccion.piso}`,
                    direccion.departamento && `Dpto ${direccion.departamento}`,
                    direccion.provinciaCiudad,
                  ]
                    .filter(Boolean)
                    .join(" - ")}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => onRemove(index)}
                color="error"
                aria-label={`Eliminar dirección ${index + 1}`}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Card>
        ))}
      </Box>
    </Card>
  );
}
