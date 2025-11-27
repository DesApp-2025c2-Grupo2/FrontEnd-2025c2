import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Typography,
  Alert,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { AfiliadosService } from "../../services/afiliadosService";

export default function ModalParametrosReporte({
  open,
  tipoReporte,
  onClose,
  onConfirm,
}) {
  const [parametros, setParametros] = useState({});
  const [errors, setErrors] = useState({});

  // Resetear parámetros cuando cambia el tipo de reporte o se abre/cierra
  useEffect(() => {
    if (open) {
      switch (tipoReporte) {
        case "alta-afiliados-periodo":
        case "alta-prestadores-periodo":
          setParametros({
            fechaDesde: null,
            fechaHasta: null,
          });
          break;

        case "prestadores-especialidad-cp":
        case "situaciones-terapeuticas-afiliado":
        case "prestadores-sin-agendas":
          setParametros({});
          break;

        default:
          setParametros({});
      }
      setErrors({});
    }
  }, [open, tipoReporte]);

  const validarParametros = () => {
    const nuevosErrores = {};

    if (
      tipoReporte === "alta-afiliados-periodo" ||
      tipoReporte === "alta-prestadores-periodo"
    ) {
      if (!parametros.fechaDesde || !dayjs(parametros.fechaDesde).isValid()) {
        nuevosErrores.fechaDesde = "La fecha desde es obligatoria";
      }
      if (!parametros.fechaHasta || !dayjs(parametros.fechaHasta).isValid()) {
        nuevosErrores.fechaHasta = "La fecha hasta es obligatoria";
      }
      if (parametros.fechaDesde && parametros.fechaHasta) {
        if (
          dayjs(parametros.fechaDesde).isAfter(dayjs(parametros.fechaHasta))
        ) {
          nuevosErrores.fechaHasta =
            "La fecha hasta debe ser posterior a la fecha desde";
        }
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleConfirm = () => {
    if (!validarParametros()) return;

    const parametrosFinales = { ...parametros };

    if (parametrosFinales.fechaDesde)
      parametrosFinales.fechaDesde = dayjs(parametrosFinales.fechaDesde).format(
        "YYYY-MM-DD"
      );

    if (parametrosFinales.fechaHasta)
      parametrosFinales.fechaHasta = dayjs(parametrosFinales.fechaHasta).format(
        "YYYY-MM-DD"
      );

    onConfirm(parametrosFinales);
  };

  const getTitulo = () => {
    const titulos = {
      "alta-afiliados-periodo": "Alta de Afiliados por Período",
      "alta-prestadores-periodo": "Alta de Prestadores por Período",
      "prestadores-especialidad-cp": "Prestadores por Especialidad y CP",
      "situaciones-terapeuticas-afiliado":
        "Situaciones Terapéuticas por Afiliado",
      "prestadores-sin-agendas": "Prestadores sin Agendas",
    };
    return titulos[tipoReporte] || "Parámetros del Reporte";
  };

  // SOLO estos 2 reportes deben pedir parámetros
  const tieneParametros = () => {
    return (
      tipoReporte === "alta-afiliados-periodo" ||
      tipoReporte === "alta-prestadores-periodo"
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {getTitulo()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Configure los parámetros para generar el reporte
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {!tieneParametros() ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              Este reporte no requiere parámetros. Se generará con toda la
              información disponible.
            </Alert>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}
            >
              <DatePicker
                label="Fecha Desde"
                value={
                  parametros.fechaDesde ? dayjs(parametros.fechaDesde) : null
                }
                onChange={(newValue) => {
                  setParametros({ ...parametros, fechaDesde: newValue });
                  setErrors({ ...errors, fechaDesde: "" });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.fechaDesde,
                    helperText: errors.fechaDesde,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fafafa",
                      },
                    },
                  },
                }}
              />

              <DatePicker
                label="Fecha Hasta"
                value={
                  parametros.fechaHasta ? dayjs(parametros.fechaHasta) : null
                }
                onChange={(newValue) => {
                  setParametros({ ...parametros, fechaHasta: newValue });
                  setErrors({ ...errors, fechaHasta: "" });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.fechaHasta,
                    helperText: errors.fechaHasta,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fafafa",
                      },
                    },
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              backgroundColor: "#2563eb",
              color: "white",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                backgroundColor: "#1d4ed8",
              },
            }}
          >
            Generar Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
