import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  ExpandMore as ExpandMoreIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import FamiliarListItem from "./FamiliarListItem";

export default function AfiliadoCard({
  afiliado,
  familiares,
  onView,
  onEdit,
  onToggleActive,
  onAddFamiliar,
  onEditFamiliar,
  onViewFamiliar,
  onToggleFamiliarActive,
  onDeleteFamiliar,
  getParentescoColor,
  getPlanColor,
}) {
  return (
    <Card
      sx={{
        p: 2,
        opacity: afiliado.activo ? 1 : 0.6,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <PersonIcon sx={{ fontSize: 40, color: "#1976d2" }} />
        </Box>

        <Box
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {afiliado.apellido}, {afiliado.nombre}
            </Typography>
            <Chip
              label={`${afiliado.planMedico}`}
              size="small"
              sx={{
                backgroundColor: getPlanColor(afiliado.planMedico),
                color: "white",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              <strong>Credencial:</strong> {afiliado.numeroAfiliado}-
              {afiliado.numeroIntegrante}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>DNI:</strong> {afiliado.numeroDocumento}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Alta:</strong>{" "}
              {new Date(afiliado.fechaAlta).toLocaleDateString("es-AR")}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Familiares:</strong> {familiares.length}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Chip
              label={afiliado.parentesco}
              size="small"
              sx={{
                backgroundColor: getParentescoColor(afiliado.parentesco),
                color: "white",
                fontWeight: "bold",
              }}
            />
            {afiliado.situacionesTerapeuticas.map((situacion, index) => (
              <Chip
                key={index}
                label={situacion}
                size="small"
                color="warning"
              />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            ml: 3,
            minWidth: 140,
          }}
        >
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => onView(afiliado)}
            variant="outlined"
            fullWidth
          >
            Ver
          </Button>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(afiliado)}
            variant="outlined"
            fullWidth
          >
            Editar
          </Button>
          <Button
            size="small"
            startIcon={afiliado.activo ? <ToggleOffIcon /> : <ToggleOnIcon />}
            color={afiliado.activo ? "error" : "success"}
            onClick={() => onToggleActive(afiliado)}
            variant="outlined"
            fullWidth
          >
            {afiliado.activo ? "Dar de baja" : "Rehabilitar"}
          </Button>
        </Box>
      </Box>

      {familiares.length > 0 && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">
              Ver Familiares ({familiares.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {familiares.map((familiar) => (
                <FamiliarListItem
                  key={familiar.id}
                  familiar={familiar}
                  afiliado={afiliado}
                  onEdit={onEditFamiliar}
                  onView={onViewFamiliar}
                  onToggleActive={onToggleFamiliarActive}
                  onDelete={onDeleteFamiliar}
                  getParentescoColor={getParentescoColor}
                />
              ))}
              <Button
                startIcon={<PersonAddIcon />}
                onClick={() => onAddFamiliar(afiliado)}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Agregar Familiar
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {familiares.length === 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<PersonAddIcon />}
            onClick={() => onAddFamiliar(afiliado)}
            variant="outlined"
            size="small"
          >
            Agregar Familiar
          </Button>
        </Box>
      )}
    </Card>
  );
}
