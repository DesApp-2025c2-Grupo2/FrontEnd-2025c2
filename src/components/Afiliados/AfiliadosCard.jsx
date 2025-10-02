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
  ExpandMore as ExpandMoreIcon,
  PersonAdd as PersonAddIcon,
  Schedule as ScheduleIcon,
  ArrowUpward as ArrowUpwardIcon,
} from "@mui/icons-material";
import PersonaListItem from "./PersonaListItem";

const padNumeroAfiliado = (n) => String(Number(n) || 0).padStart(7, "0");
const padIntegrante = (n) => String(Number(n) || 0).padStart(2, "0");

export default function AfiliadosCard({
  afiliado,
  titular,
  familiares,
  planMedico,
  estaActivo,
  tieneBajaProgramada,
  tieneAltaProgramada,
  onView,
  onEdit,
  onSetBaja,
  onSetAlta,
  onAddFamiliar,
  onEditFamiliar,
  onViewFamiliar,
  onDeleteFamiliar,
  getParentescoColor,
  getPlanColor,
  parentescos,
}) {
  const getParentescoNombre = (parentescoId) => {
    const parentesco = parentescos.find((p) => p.id === parentescoId);
    return parentesco ? parentesco.nombre : "Desconocido";
  };

  return (
    <Card
      sx={{
        p: 2,
        opacity: estaActivo ? 1 : 0.6,
        border: tieneBajaProgramada
          ? "2px solid #ff9800"
          : tieneAltaProgramada
          ? "2px solid #4caf50"
          : "1px solid #e0e0e0",
        backgroundColor: tieneBajaProgramada
          ? "#fff3e0"
          : tieneAltaProgramada
          ? "#e8f5e8"
          : "white",
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
              {titular.apellido}, {titular.nombre}
            </Typography>
            <Chip
              label={planMedico}
              size="small"
              sx={{
                backgroundColor: getPlanColor(afiliado.planMedicoId),
                color: "white",
                fontWeight: "bold",
              }}
            />
            {tieneBajaProgramada && (
              <Chip
                icon={<ScheduleIcon />}
                label="Baja Programada"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
            {tieneAltaProgramada && (
              <Chip
                icon={<ArrowUpwardIcon />}
                label="Alta Programada"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
            {!estaActivo && !tieneBajaProgramada && !tieneAltaProgramada && (
              <Chip
                label="Inactivo"
                size="small"
                color="error"
                variant="outlined"
              />
            )}
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
              <strong>Afiliado Nº:</strong>{" "}
              {padNumeroAfiliado(afiliado.numeroAfiliado)}-
              {padIntegrante(titular.numeroIntegrante)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Alta:</strong>{" "}
              {afiliado.alta
                ? new Date(afiliado.alta).toLocaleDateString("es-AR", {
                    timeZone: "UTC",
                  })
                : ""}
            </Typography>
            {afiliado.baja && (
              <Typography variant="body2" color="textSecondary">
                <strong>Baja:</strong>{" "}
                {new Date(afiliado.baja).toLocaleDateString("es-AR", {
                  timeZone: "UTC",
                })}
              </Typography>
            )}
            <Typography variant="body2" color="textSecondary">
              <strong>Integrantes:</strong> {familiares.length + 1}
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
              label={getParentescoNombre(titular.parentesco)}
              size="small"
              sx={{
                backgroundColor: getParentescoColor(titular.parentesco),
                color: "white",
                fontWeight: "bold",
              }}
            />
            {titular.situacionesTerapeuticas?.map((situacion, index) => (
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

          {/* Botón condicional para Alta/Baja */}
          {!estaActivo || tieneBajaProgramada || tieneAltaProgramada ? (
            <Button
              size="small"
              startIcon={<ArrowUpwardIcon />}
              color="success"
              onClick={() => onSetAlta(afiliado)}
              variant="outlined"
              fullWidth
            >
              {tieneAltaProgramada ? "Gestionar Alta" : "Programar Alta"}
            </Button>
          ) : (
            <Button
              size="small"
              startIcon={<ScheduleIcon />}
              color="error"
              onClick={() => onSetBaja(afiliado)}
              variant="outlined"
              fullWidth
            >
              Programar Baja
            </Button>
          )}
        </Box>
      </Box>

      {familiares.length > 0 && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">
              Ver Integrantes del Grupo Familiar ({familiares.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {familiares.map((familiar) => (
                <PersonaListItem
                  key={familiar.id}
                  persona={familiar}
                  afiliado={afiliado}
                  onEdit={onEditFamiliar}
                  onView={onViewFamiliar}
                  onDelete={onDeleteFamiliar}
                  getParentescoColor={getParentescoColor}
                  getParentescoNombre={getParentescoNombre}
                />
              ))}
              <Button
                startIcon={<PersonAddIcon />}
                onClick={() => onAddFamiliar(afiliado)}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Agregar Integrante
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
            Agregar Integrante al Grupo Familiar
          </Button>
        </Box>
      )}
    </Card>
  );
}
