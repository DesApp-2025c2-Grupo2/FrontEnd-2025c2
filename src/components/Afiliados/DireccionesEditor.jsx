import {
  Box,
  Typography,
  Card,
  TextField,
  IconButton,
  Grid,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useState } from "react";

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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validar campos
  const validateField = (name, value) => {
    switch (name) {
      case "calle":
        return !value?.trim() ? "La calle es obligatoria" : "";
      case "altura":
        return !value?.trim() ? "La altura es obligatoria" : "";
      case "provinciaCiudad":
        return !value?.trim() ? "La provincia/ciudad es obligatoria" : "";
      default:
        return "";
    }
  };

  // Validar todo el formulario
  const validateForm = (direccion) => {
    const newErrors = {};
    newErrors.calle = validateField("calle", direccion.calle);
    newErrors.altura = validateField("altura", direccion.altura);
    newErrors.provinciaCiudad = validateField(
      "provinciaCiudad",
      direccion.provinciaCiudad
    );
    return newErrors;
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    const errors = validateForm(newValue);
    return !errors.calle && !errors.altura && !errors.provinciaCiudad;
  };

  // Manejar cambios en los campos
  const handleFieldChange = (field, value) => {
    onNewValueChange({ ...newValue, [field]: value });

    // Si el campo ya fue tocado, validar inmediatamente
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // Manejar blur de los campos (cuando pierden el foco)
  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, newValue[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleAdd = () => {
    // Marcar todos los campos como tocados para mostrar todos los errores
    const allTouched = {
      calle: true,
      altura: true,
      piso: true,
      departamento: true,
      provinciaCiudad: true,
    };
    setTouched(allTouched);

    // Validar todos los campos
    const newErrors = validateForm(newValue);
    setErrors(newErrors);

    // Si no hay errores, agregar la dirección
    if (isFormValid()) {
      onAdd({
        ...newValue,
        calle: newValue.calle.trim(),
        altura: newValue.altura.trim(),
        piso: newValue.piso?.trim() || "",
        departamento: newValue.departamento?.trim() || "",
        provinciaCiudad: newValue.provinciaCiudad.trim(),
      });

      // Limpiar el formulario
      onNewValueChange({
        calle: "",
        altura: "",
        piso: "",
        departamento: "",
        provinciaCiudad: "",
      });

      // Limpiar errores y touched
      setErrors({});
      setTouched({});
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
              label="Calle *"
              value={newValue.calle || ""}
              onChange={(e) => handleFieldChange("calle", e.target.value)}
              onBlur={() => handleFieldBlur("calle")}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              error={!!errors.calle}
              helperText={errors.calle}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Altura *"
              value={newValue.altura || ""}
              onChange={(e) => handleFieldChange("altura", e.target.value)}
              onBlur={() => handleFieldBlur("altura")}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              error={!!errors.altura}
              helperText={errors.altura}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Piso"
              value={newValue.piso || ""}
              onChange={(e) => handleFieldChange("piso", e.target.value)}
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
                handleFieldChange("departamento", e.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Provincia/Ciudad *"
              value={newValue.provinciaCiudad || ""}
              onChange={(e) =>
                handleFieldChange("provinciaCiudad", e.target.value)
              }
              onBlur={() => handleFieldBlur("provinciaCiudad")}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              error={!!errors.provinciaCiudad}
              helperText={errors.provinciaCiudad}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={disabled || !isFormValid()}
              sx={{ mt: 1 }}
            >
              Agregar Dirección
            </Button>
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
                disabled={disabled}
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
