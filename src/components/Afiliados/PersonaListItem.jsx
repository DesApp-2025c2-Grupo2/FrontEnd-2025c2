import { Box, Typography, Card, Chip, IconButton } from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

export default function PersonaListItem({
  persona,
  afiliado,
  onEdit,
  onView,
  onDelete,
  getParentescoColor,
  getParentescoNombre,
}) {
  return (
    <Card
      sx={{
        p: 2,
        backgroundColor: "#f8f9fa",
        opacity: !persona.baja || new Date(persona.baja) > new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              }) ? 1 : 0.6,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {persona.nombre} {persona.apellido}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Integrante Nº:</strong> {persona.numeroIntegrante} |{" "}
            <strong>Nacimiento:</strong>{" "}
            {new Date(persona.fechaNacimiento).toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })}
          </Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={getParentescoNombre(persona.parentesco)}
              size="small"
              sx={{
                backgroundColor: getParentescoColor(persona.parentesco),
                color: "white",
                fontWeight: "bold",
              }}
            />
            {persona.situacionesTerapeuticas?.map((situacion, index) => (
              <Chip
                key={index}
                label={situacion}
                size="small"
                color="warning"
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onView(persona, afiliado)}
            color="info"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(persona, afiliado)}>
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(persona, afiliado)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
