import { useState, useMemo } from "react";
import {
  Card,
  Box,
  Typography,
  IconButton,
  Chip,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

export default function EspecialidadesSelector({
  items = [],
  opciones = [],
  onAdd,
  onRemove,
  disabled = false,
}) {
  // Opciones disponibles (activas y no seleccionadas)
  const opcionesDisponibles = useMemo(
    () =>
      opciones.filter(
        (opt) => opt.activa && !items.some((item) => item.id === opt.id)
      ),
    [opciones, items]
  );

  const handleSelectChange = (_, values) => {
    // Detectar cuál se agregó (la última seleccionada)
    const ultima = values[values.length - 1];
    if (!ultima) return;

    if (!items.some((i) => i.id === ultima.id)) {
      onAdd(ultima.id);
    }
  };

  return (
    <Card sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle2">Especialidades</Typography>
      </Box>

      {/* AUTOCOMPLETE MULTIPLE */}
      <Autocomplete
        multiple
        disableCloseOnSelect
        disabled={disabled}
        options={opcionesDisponibles}
        getOptionLabel={(opt) => opt.nombre}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Agregar especialidades"
            placeholder="Buscar..."
            size="small"
          />
        )}
        onChange={handleSelectChange}
        value={[]} // Siempre vacío para mantener las chips abajo
      />

      {/* Lista de especialidades asignadas */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
        {items.length === 0 && (
          <Typography variant="body2" color="textSecondary">
            No hay especialidades asignadas
          </Typography>
        )}

        {items.map((esp, index) => (
          <Box
            key={esp.id}
            sx={{
              p: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 1,
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="body2">{esp.nombre}</Typography>

            <IconButton
              size="small"
              onClick={() => onRemove(index)}
              color="error"
              disabled={disabled}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
