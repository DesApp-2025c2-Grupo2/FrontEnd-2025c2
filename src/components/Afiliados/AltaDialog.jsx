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

export default function AltaDialog({
  open,
  afiliado,
  onClose,
  onConfirm,
  onCancelAlta,
  onReactivar,
}) {
  const [fechaAlta, setFechaAlta] = useState("");
  const [esAltaInmediata, setEsAltaInmediata] = useState(true);

  useEffect(() => {
    if (open) {
      setFechaAlta(hoyISO());
      setEsAltaInmediata(true);
    }
  }, [open]);

  const handleConfirm = () => {
    let fechaAltaFinal;

    if (esAltaInmediata) {
      // Para alta inmediata, usar fecha y hora actual
      fechaAltaFinal = new Date().toISOString();
    } else {
      // Para alta programada, usar inicio del día seleccionado
      fechaAltaFinal = fechaAlta + "T00:00:00";
    }

    if (!fechaAltaFinal) return;

    if (esAltaInmediata && afiliado?.baja) {
      onReactivar(afiliado);
    } else {
      onConfirm(afiliado, fechaAltaFinal);
    }
    onClose();
  };

  const hoy = startOfDay(new Date());
  const tieneAltaProgramada =
    Boolean(afiliado?.alta) && startOfDay(new Date(afiliado.alta)) > hoy;
  const esFechaFutura =
    Boolean(fechaAlta) && startOfDay(new Date(fechaAlta)) > hoy;
  const esFechaPasada =
    Boolean(fechaAlta) && startOfDay(new Date(fechaAlta)) < hoy;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {tieneAltaProgramada
          ? "Gestión de Alta Programada"
          : afiliado?.baja
          ? "Programar Alta del Afiliado"
          : "Alta del Afiliado"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {tieneAltaProgramada ? (
            <>
              <Typography variant="body1" gutterBottom>
                Este afiliado tiene una alta programada para el{" "}
                <strong>
                  {new Date(afiliado.alta).toLocaleDateString("es-AR")}
                </strong>
                .
              </Typography>
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                Puede cancelar la alta programada o modificar la fecha.
              </Alert>

              <FormControlLabel
                control={
                  <Checkbox
                    color="secondary"
                    checked={esAltaInmediata}
                    onChange={(e) => setEsAltaInmediata(e.target.checked)}
                  />
                }
                label="Alta inmediata (hoy)"
                sx={{ mb: 2 }}
              />

              {!esAltaInmediata && (
                <TextField
                  fullWidth
                  label="Nueva fecha de alta"
                  type="date"
                  value={fechaAlta}
                  onChange={(e) => setFechaAlta(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={esFechaPasada}
                  helperText={
                    esFechaPasada
                      ? "La fecha de alta no puede ser anterior a hoy"
                      : esFechaFutura
                      ? "El afiliado se activará en esta fecha futura"
                      : "Seleccione la fecha de alta"
                  }
                />
              )}
            </>
          ) : afiliado?.baja ? (
            <>
              <Typography variant="body1" gutterBottom>
                Este afiliado está actualmente de baja. Programe una fecha de
                alta para reactivarlo.
              </Typography>
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                Al programar el alta, la baja existente será cancelada.
              </Alert>

              <FormControlLabel
                control={
                  <Checkbox
                    color="secondary"
                    checked={esAltaInmediata}
                    onChange={(e) => setEsAltaInmediata(e.target.checked)}
                  />
                }
                label="Alta inmediata (hoy)"
                sx={{ mb: 2 }}
              />

              {!esAltaInmediata && (
                <TextField
                  fullWidth
                  label="Fecha de alta"
                  type="date"
                  value={fechaAlta}
                  onChange={(e) => setFechaAlta(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={esFechaPasada}
                  helperText={
                    esFechaPasada
                      ? "La fecha de alta no puede ser anterior a hoy"
                      : esFechaFutura
                      ? "El afiliado se activará en esta fecha futura"
                      : "Seleccione la fecha de alta"
                  }
                />
              )}

              {esFechaFutura && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  El afiliado se activará el{" "}
                  {new Date(fechaAlta).toLocaleDateString("es-AR")}. La baja
                  existente será cancelada.
                </Alert>
              )}
              {esAltaInmediata && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  El afiliado será activado inmediatamente. La baja existente
                  será cancelada.
                </Alert>
              )}
            </>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                Seleccione la fecha de alta para el afiliado:
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    color="secondary"
                    checked={esAltaInmediata}
                    onChange={(e) => setEsAltaInmediata(e.target.checked)}
                  />
                }
                label="Alta inmediata (hoy)"
                sx={{ mb: 2 }}
              />

              {!esAltaInmediata && (
                <TextField
                  fullWidth
                  label="Fecha de alta"
                  type="date"
                  value={fechaAlta}
                  onChange={(e) => setFechaAlta(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={esFechaPasada}
                  helperText={
                    esFechaPasada
                      ? "La fecha de alta no puede ser anterior a hoy"
                      : esFechaFutura
                      ? "El afiliado se activará en esta fecha futura"
                      : "Seleccione la fecha de alta"
                  }
                />
              )}

              {esFechaFutura && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  El afiliado se activará el{" "}
                  {new Date(fechaAlta).toLocaleDateString("es-AR")}.
                </Alert>
              )}
              {esAltaInmediata && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  El afiliado será activado inmediatamente.
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

        {tieneAltaProgramada && (
          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              onCancelAlta(afiliado);
              onClose();
            }}
          >
            Cancelar Alta Programada
          </Button>
        )}

        <Button
          variant="contained"
          color="success"
          onClick={handleConfirm}
          disabled={!esAltaInmediata && (!fechaAlta || esFechaPasada)}
        >
          {tieneAltaProgramada
            ? "Modificar Alta"
            : afiliado?.baja
            ? "Programar Alta"
            : "Confirmar Alta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
