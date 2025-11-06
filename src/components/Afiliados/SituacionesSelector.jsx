import { useState } from "react";
import {
  Card,
  Box,
  Typography,
  Select,
  MenuItem,
  IconButton,
  TextField,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

/**
 * items: array de objetos {id, nombre, fechaFin} (situaciones ya asignadas)
 * opciones: array de objetos { id, nombre, descripcion, activa }
 * onAdd(nombre) -> agrega nombre
 * onRemove(index) -> quita por índice
 * disabled optional
 */
export default function SituacionesSelector({
  items = [],
  opciones = [],
  onAdd,
  onRemove,
  onUpdate,
  disabled = false,
}) {
  const [selectedId, setSelectedId] = useState("");

  const handleAdd = () => {
    if (!selectedId) return;
    const opt = opciones.find((o) => o.id === selectedId);
    if (!opt) return;
    const nuevaSituacion = {
      id: opt.id,
      nombre: opt.nombre,
      fechaFin: null, // Cambiado de "" a null
    };
    const exists = items.some((i) => i.id === opt.id);
    if (!exists) {
      onAdd(nuevaSituacion);
      setSelectedId("");
    }
  };

  const handleDateChange = (idx, value) => {
    onUpdate(idx, {
      ...items[idx],
      fechaFin: value || null, // Convierte string vacío a null
    });
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
        <IconButton
          onClick={handleAdd}
          color="secondary"
          disabled={disabled || !selectedId}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.length === 0 && (
          <Typography variant="body2" color="textSecondary">
            No hay situaciones asignadas
          </Typography>
        )}
        {items.map((it, idx) => (
          <Box
            key={idx}
            sx={{
              p: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: 1,
              backgroundColor: "white",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2">{it.nombre}</Typography>
              <IconButton
                size="small"
                onClick={() => onRemove(idx)}
                color="error"
                disabled={disabled}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Fecha Fin"
                type="date"
                size="small"
                value={it.fechaFin || ""} // Maneja null como string vacío
                InputLabelProps={{ shrink: true }}
                onChange={(e) => handleDateChange(idx, e.target.value)}
                disabled={disabled}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
