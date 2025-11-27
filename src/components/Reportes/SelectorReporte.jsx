import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import ModalParametrosReporte from "./ModalParametrosReporte";

export default function SelectorReporte({
  tiposReportes = [],
  reporteSeleccionado,
  especialidades = [],
  afiliados = [],
  onSeleccionarReporte,
  onGenerarReporte,
  onExportarReporte,
  generandoReporte = false,
  exportandoReporte = false,
  error = null,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const tiposReportesFiltrados = tiposReportes.filter(
    (t) => t.id !== "horarios-sin-turnos"
  );

  useEffect(() => {
    if (reporteSeleccionado === "horarios-sin-turnos") {
      onSeleccionarReporte("");
    }
  }, [reporteSeleccionado, onSeleccionarReporte]);

  const handleGenerar = () => {
    if (!reporteSeleccionado) return;

    // Solo estos 2 reportes requieren parámetros
    const necesitaParametros =
      reporteSeleccionado === "alta-afiliados-periodo" ||
      reporteSeleccionado === "alta-prestadores-periodo";

    if (necesitaParametros) {
      setModalAbierto(true);
    } else {
      onGenerarReporte({
        tipoReporte: reporteSeleccionado,
        parametros: {},
      });
    }
  };

  const handleConfirmarParametros = (parametros) => {
    setModalAbierto(false);
    onGenerarReporte({
      tipoReporte: reporteSeleccionado,
      parametros: parametros || {},
    });
  };

  const handleExportar = () => {
    if (reporteSeleccionado) {
      onExportarReporte({
        reporteId: reporteSeleccionado,
        formato: "PDF",
        tipoReporte: reporteSeleccionado,
      });
    }
  };

  const tipoSeleccionado = tiposReportesFiltrados.find(
    (t) => t.id === reporteSeleccionado
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1f2937",
          mb: 2,
          fontSize: "1.25rem",
        }}
      >
        Seleccionar Reporte
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} alignItems="flex-end">
        <FormControl sx={{ minWidth: 300, flexGrow: 1 }}>
          <InputLabel sx={{ fontWeight: 600, color: "#374151" }}>
            Tipo de Reporte
          </InputLabel>
          <Select
            value={reporteSeleccionado || ""}
            onChange={(e) => onSeleccionarReporte(e.target.value)}
            label="Tipo de Reporte"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fafafa",
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                },
              },
            }}
          >
            {tiposReportesFiltrados.map((tipo) => (
              <MenuItem key={tipo.id} value={tipo.id}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {tipo.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tipo.descripcion}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={
            generandoReporte ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PlayArrowIcon />
            )
          }
          onClick={handleGenerar}
          disabled={!reporteSeleccionado || generandoReporte}
          sx={{
            backgroundColor: "#6b7280",
            color: "white",
            fontWeight: 700,
            textTransform: "none",
            px: 3,
            py: 1.5,
            "&:hover": {
              backgroundColor: "#4b5563",
            },
            "&:disabled": {
              backgroundColor: "#d1d5db",
              color: "#9ca3af",
            },
          }}
        >
          {generandoReporte ? "GENERANDO..." : "GENERAR"}
        </Button>
      </Stack>

      {tipoSeleccionado && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "#f8fafc",
            borderRadius: 1,
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {tipoSeleccionado.descripcion}
          </Typography>
        </Box>
      )}

      <ModalParametrosReporte
        open={modalAbierto}
        tipoReporte={reporteSeleccionado}
        especialidades={especialidades}
        afiliados={afiliados}
        onClose={() => setModalAbierto(false)}
        onConfirm={handleConfirmarParametros}
      />
    </Box>
  );
}
