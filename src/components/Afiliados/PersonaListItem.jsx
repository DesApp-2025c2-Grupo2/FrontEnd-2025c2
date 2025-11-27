import { Box, Typography, Card, Chip, IconButton } from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";

const padIntegrante = (n) => String(Number(n) || 0).padStart(2, "0");
const padAfiliado = (n) => String(Number(n) || 0).padStart(7, "0");

export default function PersonaListItem({
  persona,
  afiliado,
  onEdit,
  onView,
  onSetBaja,
  onSetAlta,
  getParentescoColor,
  getParentescoNombre,
}) {
  const estaActivo = (alta, baja) => {
    const fechaAlta = new Date(alta);
    if (!baja) return true; // sin fecha de baja → activo

    const fechaBaja = new Date(baja);
    return fechaAlta > fechaBaja; // activo solo si alta es más nueva que baja
  };

  const tieneBajaProgramada = (baja) => {
    if (!baja) return false;
    return new Date(baja) > new Date();
  };

  const tieneAltaProgramada = (alta) => {
    if (!alta) return false;
    return new Date(alta) > new Date();
  };

  return (
    <Card
      sx={{
        p: 2,
        opacity: estaActivo(persona?.alta, persona?.baja) ? 1 : 0.6,
        border: tieneBajaProgramada(persona?.baja)
          ? "2px solid #ff9800"
          : tieneAltaProgramada(persona?.alta)
          ? "2px solid #4caf50"
          : "1px solid #e0e0e0",
        backgroundColor: tieneBajaProgramada(persona?.baja)
          ? "#fff3e0"
          : tieneAltaProgramada(persona?.alta)
          ? "#e8f5e8"
          : "#f8f9fa",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: { xs: 2, sm: 0 },
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
              const hoy = new Date().setHours(0, 0, 0, 0);
              const baja = situacion.fechaBaja
                ? new Date(situacion.fechaBaja).setHours(0, 0, 0, 0)
                : null;
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
                      ? `Alta: ${new Date(
                          situacion.fechaAlta
                        ).toLocaleDateString("es-AR")}`
                      : "") +
                    (situacion.fechaBaja
                      ? ` | Baja: ${new Date(
                          situacion.fechaBaja
                        ).toLocaleDateString("es-AR")}`
                      : "")
                  }
                />
              );
            })}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: "row",
            justifyContent: { xs: "center", sm: "flex-end" },
            mt: { xs: 2, sm: 0 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {/* VER */}
          <IconButton size="small" onClick={() => onView()} color="info">
            <VisibilityIcon />
          </IconButton>
          {/* EDITAR */}
          <IconButton size="small" onClick={() => onEdit()}>
            <EditIcon />
          </IconButton>
          {/* BAJA */}
          {tieneBajaProgramada(persona?.baja) ? (
            <IconButton onClick={() => onSetBaja(persona)} color="warning">
              <ArrowDownwardIcon />
            </IconButton>
          ) : tieneAltaProgramada(persona?.alta) ? (
            <IconButton onClick={() => onSetAlta(persona)} color="success">
              <ArrowUpwardIcon />
            </IconButton>
          ) : !estaActivo(persona?.alta, persona?.baja) ? (
            <IconButton onClick={() => onSetAlta(persona)} color="success">
              <ArrowUpwardIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => onSetBaja(persona)} color="error">
              <ArrowDownwardIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Card>
  );
}
