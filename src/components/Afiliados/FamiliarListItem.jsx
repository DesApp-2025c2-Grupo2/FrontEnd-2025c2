import { Box, Typography, Card, Chip, IconButton } from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from "@mui/icons-material";

export default function FamiliarListItem({
  familiar,
  afiliado,
  onEdit,
  onToggleActive,
  onDelete,
  getParentescoColor,
}) {
  return (
    <Card
      sx={{
        p: 2,
        backgroundColor: "#f8f9fa",
        opacity: familiar.activo ? 1 : 0.6,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {familiar.nombre} {familiar.apellido}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>DNI:</strong> {familiar.numeroDocumento} |{" "}
            <strong>Credencial:</strong> {familiar.numeroAfiliado}-
            {familiar.numeroIntegrante}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              label={familiar.parentesco === "ACargo" ? "A Cargo" : familiar.parentesco}
              size="small"
              sx={{
                backgroundColor: getParentescoColor(familiar.parentesco),
                color: "white",
                fontWeight: "bold",
              }}
            />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onEdit(familiar, afiliado)}
            color="black"
          >
            <EditIcon/>
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onToggleActive(familiar)}
            color={familiar.activo ? "error" : "success"}
          >
            {familiar.activo ? <ToggleOffIcon /> : <ToggleOnIcon />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(familiar, afiliado)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
