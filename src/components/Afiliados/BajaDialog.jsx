import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";

const hoyISO = () => new Date().toISOString().split("T")[0];

const startOfDay = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

export default function BajaDialog({
  open,
  afiliado,
  onClose,
  onConfirm,
  onCancelBaja,
}) {
  const [fechaBaja, setFechaBaja] = useState("");
  const [esBajaInmediata, setEsBajaInmediata] = useState(true);

  useEffect(() => {
    if (open) {
      setFechaBaja(hoyISO());
      setEsBajaInmediata(true);
    }
  }, [open]);

  const handleConfirm = () => {
    let fechaFinal;

    if (esBajaInmediata) {
      // Para baja inmediata, usar fecha y hora actual con calculo de zona horaria
      const fechaAux = new Date().getTime() - 3 * 60 * 60 * 1000;
      fechaFinal = new Date(fechaAux).toISOString();
    } else {
      // Para baja programada, usar horario 00:00
      fechaFinal = fechaBaja + "T00:00:00";
    }

    if (!fechaFinal) return;
    onConfirm(afiliado, fechaFinal);
    onClose();
  };

  const hoy = startOfDay(new Date());

  const afiliadoTieneBaja = Boolean(afiliado?.baja);

  const bajaEsFutura =
    afiliadoTieneBaja && startOfDay(new Date(afiliado.baja)) > hoy;

  const esFechaFutura =
    Boolean(fechaBaja) && startOfDay(new Date(fechaBaja)) > hoy;
  const esFechaPasada =
    Boolean(fechaBaja) && startOfDay(new Date(fechaBaja)) < hoy;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {bajaEsFutura
          ? "Gestión de Baja Programada"
          : afiliado?.baja
          ? "Gestión de Baja del Afiliado"
          : "Programar Baja del Afiliado"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {bajaEsFutura ? (
            <>
              <Typography variant="body1" gutterBottom>
                Este afiliado tiene una baja programada para el{" "}
                <strong>
                  {new Date(fechaBaja)
                    .toISOString()
                    .slice(0, 10)
                    .split("-")
                    .reverse()
                    .join("/")}
                </strong>
                .
              </Typography>

              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                Puede cancelar la baja programada o modificar la fecha.
              </Alert>

              <FormControlLabel
                control={
                  <Checkbox
                    color="secondary"
                    checked={esBajaInmediata}
                    onChange={(e) => setEsBajaInmediata(e.target.checked)}
                  />
                }
                label="Baja inmediata (hoy)"
                sx={{ mb: 2 }}
              />

              {!esBajaInmediata && (
                <TextField
                  fullWidth
                  label="Nueva fecha de baja"
                  type="date"
                  value={fechaBaja}
                  onChange={(e) => setFechaBaja(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={esFechaPasada}
                  helperText={
                    esFechaPasada
                      ? "La fecha de baja no puede ser anterior a hoy"
                      : esFechaFutura
                      ? "La baja se programará para esta fecha futura"
                      : "Seleccione la fecha de baja"
                  }
                />
              )}
            </>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                Seleccione la fecha de baja para el afiliado:
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    color="secondary"
                    checked={esBajaInmediata}
                    onChange={(e) => setEsBajaInmediata(e.target.checked)}
                  />
                }
                label="Baja inmediata (hoy)"
                sx={{ mb: 2 }}
              />

              {!esBajaInmediata && (
                <TextField
                  fullWidth
                  label="Fecha de baja"
                  type="date"
                  value={fechaBaja}
                  onChange={(e) => setFechaBaja(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={esFechaPasada}
                  helperText={
                    esFechaPasada
                      ? "La fecha de baja no puede ser anterior a hoy"
                      : esFechaFutura
                      ? "La baja se programará para esta fecha futura"
                      : "Seleccione la fecha de baja"
                  }
                />
              )}

              {esFechaFutura && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  El afiliado permanecerá activo hasta el{" "}
                  {new Date(fechaBaja)
                    .toISOString()
                    .slice(0, 10)
                    .split("-")
                    .reverse()
                    .join("/")}
                </Alert>
              )}
              {esBajaInmediata && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  El afiliado será dado de baja inmediatamente.
                </Alert>
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>

        {bajaEsFutura && (
          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              onCancelBaja(afiliado);
              onClose();
            }}
          >
            Cancelar Baja Programada
          </Button>
        )}

        <Button
          variant="contained"
          color={afiliadoTieneBaja ? "warning" : "error"}
          onClick={handleConfirm}
          disabled={!esBajaInmediata && (!fechaBaja || esFechaPasada)}
        >
          {bajaEsFutura
            ? "Modificar Baja"
            : afiliado?.baja
            ? "Programar Baja"
            : "Confirmar Baja"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
