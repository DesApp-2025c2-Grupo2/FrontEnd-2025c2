import { Card, Box, Typography, Button, Chip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ScheduleIcon from "@mui/icons-material/Schedule";

export default function TarjetaPrestadorSimple({
  prestador,
  onVer,
  onEditar,
  onAbrirAgenda,
  onToggleStatus,
}) {
  const estaActivo = !prestador.baja;

  return (
    <Card sx={{ p: 2, opacity: estaActivo ? 1 : 0.6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {prestador.nombreCompleto}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>CUIL/CUIT:</strong> {prestador.cuilCuit}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Chip label={prestador.tipo} size="small" sx={{ mt: 1 }} />
            {prestador.centro && (
              <Chip
                label={`Centro: ${prestador.centro.nombreCompleto}`}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}

            {/* Estado */}
            {!estaActivo && (
              <Chip
                label="Inactivo"
                size="small"
                color="error"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => onVer(prestador, true)}
          >
            Ver
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEditar(prestador, false)}
          >
            Editar
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ScheduleIcon />}
            onClick={() => onAbrirAgenda(prestador)}
          >
            Agendas
          </Button>

          {estaActivo ? (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<ScheduleIcon />}
              onClick={() => onToggleStatus(prestador.id)}
            >
              Dar de Baja
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              color="success"
              startIcon={<ArrowUpwardIcon />}
              onClick={() => onToggleStatus(prestador.id)}
            >
              Dar de Alta
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
}
