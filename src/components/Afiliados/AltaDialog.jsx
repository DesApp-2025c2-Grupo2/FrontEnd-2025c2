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
      const hoy = new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });
      setFechaAlta(hoy);
      setEsAltaInmediata(true);
    }
  }, [open]);

  const handleConfirm = () => {
    let fechaAltaFinal;

    if (esAltaInmediata) {
      fechaAltaFinal = new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });
    } else if (fechaAlta) {
      fechaAltaFinal = fechaAlta;
    }

    if (fechaAltaFinal) {
      if (esAltaInmediata && afiliado?.baja) {
        // Si es alta inmediata y tiene baja, usar reactivación
        onReactivar(afiliado);
      } else {
        // Si es alta programada, usar programación normal
        onConfirm(afiliado, fechaAltaFinal);
      }
    }
    onClose();
  };

  const tieneAltaProgramada =
    afiliado?.alta && new Date(afiliado.alta) > new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });

  // Definir las variables que faltaban
  const esFechaFutura = fechaAlta && new Date(fechaAlta) > new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });
  const esFechaPasada = fechaAlta && new Date(fechaAlta) < new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });

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
                  {new Date(afiliado.alta).toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })}
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
                  {new Date(fechaAlta).toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })}. La baja
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
                  {new Date(fechaAlta).toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })}.
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
            onClick={() => onCancelAlta(afiliado)}
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
