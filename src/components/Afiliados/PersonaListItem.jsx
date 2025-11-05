import { Box, Typography, Card, Chip, IconButton } from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const startOfDay = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const padIntegrante = (n) => String(Number(n) || 0).padStart(2, "0");
const padAfiliado = (n) => String(Number(n) || 0).padStart(7, "0");

export default function PersonaListItem({
  persona,
  afiliado,
  onEdit,
  onView,
  onDelete,
  getParentescoColor,
  getParentescoNombre,
}) {
  const hoy = startOfDay(new Date());
  const tieneBaja = Boolean(persona?.baja);
  const bajaEsFutura = tieneBaja && startOfDay(new Date(persona.baja)) > hoy;

  return (
    <Card
      sx={{
        p: 2,
        backgroundColor: "#f8f9fa",
        opacity: !tieneBaja || bajaEsFutura ? 1 : 0.6,
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
            <strong>Afiliado Nº:</strong>{" "}
            {padAfiliado(afiliado?.numeroAfiliado)}-
            {padIntegrante(persona.numeroIntegrante)} |{" "}
            <strong>Nacimiento:</strong>{" "}
            {persona.fechaNacimiento
              ? new Date(persona.fechaNacimiento).toLocaleDateString("es-AR", {
                  timeZone: "UTC",
                })
              : ""}
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
            {persona.situacionesTerapeuticas?.map((situacion, index) => {
                const hoy = new Date().setHours(0,0,0,0);
                const baja = situacion.fechaBaja ? new Date(situacion.fechaBaja).setHours(0,0,0,0) : null;
                const activa = !baja || baja > hoy;

                return (
                  <Chip
                    key={index}
                    label={situacion.nombre}
                    size="small"
                    color={activa ? "warning" : "default"}
                    variant={activa ? "filled" : "outlined"}
                    title={
                      (situacion.fechaAlta
                        ? `Alta: ${new Date(situacion.fechaAlta).toLocaleDateString("es-AR")}`
                        : "") +
                      (situacion.fechaBaja
                        ? ` | Baja: ${new Date(situacion.fechaBaja).toLocaleDateString("es-AR")}`
                        : "")
                    }
                  />
                );
            })}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onView()}
            color="info"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit()}>
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete()}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
