import { useState } from "react";
import { Card, Box, Typography, Select, MenuItem, IconButton } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

/**
 * items: array de strings (nombres de situaciones) actualmente asignadas
 * opciones: array de objetos { id, nombre, descripcion, activa }
 * onAdd(nombre) -> agrega nombre
 * onRemove(index) -> quita por índice
 * disabled optional
 */
export default function SituacionesSelector({ items = [], opciones = [], onAdd, onRemove, disabled = false }) {
  const [selectedId, setSelectedId] = useState("");

  const handleAdd = () => {
    if (!selectedId) return;
    const opt = opciones.find((o) => o.id === selectedId);
    if (!opt) return;
    const nombre = opt.nombre;
    const exists = items.some((i) => String(i).trim().toLowerCase() === String(nombre).trim().toLowerCase());
    if (!exists) {
      onAdd(nombre);
      setSelectedId("");
    }
  };

  return (
    <Card sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle2">Situaciones Terapéuticas</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
        <Select
          fullWidth
          size="small"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          displayEmpty
          disabled={disabled}
        >
          <MenuItem value="">Seleccionar situación...</MenuItem>
          {opciones
            .filter((o) => o.activa)
            .map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                {opt.nombre}
              </MenuItem>
            ))}
        </Select>
        <IconButton onClick={handleAdd} color="secondary" disabled={disabled || !selectedId}>
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.length === 0 && <Typography variant="body2" color="textSecondary">No hay situaciones asignadas</Typography>}
        {items.map((it, idx) => (
          <Box key={idx} sx={{ p: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 1, backgroundColor: "white" }}>
            <Typography variant="body2">{it}</Typography>
            <IconButton size="small" onClick={() => onRemove(idx)} color="error" disabled={disabled}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
