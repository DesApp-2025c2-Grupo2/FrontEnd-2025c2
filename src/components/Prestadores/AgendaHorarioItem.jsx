import { Box, Typography, IconButton, Chip, Divider } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AgendaHorarioItem({
  data,
  agendaId,
  index,
  onEdit,
  onDelete,
}) {
  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: "#fafafa",
      }}
    >

      {/* Especialidad y horario */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {data.especialidad?.nombre || "Sin especialidad"} — {data.horaInicio} a{" "}
        {data.horaFin}
      </Typography>

      {/* Profesional asignado (si lo hay) */}
      {data.profesionalAsignado && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Profesional:{" "}
          <strong>{data.profesionalAsignado.nombreCompleto}</strong>
        </Typography>
      )}

      {/* Días */}
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        {data.diasAtencion.map((d) => (
          <Chip
            key={d.id || d.dia}
            label={["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][d.dia]}
            size="small"
          />
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Botones */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton color="primary" onClick={onEdit}>
          <EditIcon />
        </IconButton>

        <IconButton color="error" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
