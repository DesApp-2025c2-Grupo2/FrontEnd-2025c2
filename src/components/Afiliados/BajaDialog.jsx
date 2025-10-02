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

export default function BajaDialog({
  open,
  afiliado,
  onClose,
  onConfirm,
  onCancelBaja,
}) {
  const [fechaBaja, setFechaBaja] = useState("");
  const [esBajaInmediata, setEsBajaInmediata] = useState(true);

  // Resetear estado cuando se abre/cierra el diálogo
  useEffect(() => {
    if (open) {
      const hoy = new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });
      setFechaBaja(hoy);
      setEsBajaInmediata(true);
    }
  }, [open]);

  const handleConfirm = () => {
    if (esBajaInmediata) {
      onConfirm(afiliado, new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              }));
    } else if (fechaBaja) {
      onConfirm(afiliado, fechaBaja);
    }
    onClose();
  };

  const handleCancelBaja = () => {
    onCancelBaja(afiliado);
    onClose();
  };

  const esFechaFutura = fechaBaja && new Date(fechaBaja) > new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });
  const esFechaPasada = fechaBaja && new Date(fechaBaja) < new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {afiliado?.baja
          ? "Gestión de Baja del Afiliado"
          : "Programar Baja del Afiliado"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {afiliado?.baja ? (
            <>
              <Typography variant="body1" gutterBottom>
                Este afiliado tiene una baja programada para el{" "}
                <strong>
                  {new Date(afiliado.baja).toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })}
                </strong>
                .
              </Typography>

              {new Date(afiliado.baja) > new Date().toLocaleDateString("es-AR", {
                timeZone: "UTC",
              }) ? (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  La baja aún no ha entrado en efecto. Puede cancelarla o
                  modificar la fecha.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                  La baja ya está en efecto. Puede cancelarla para reactivar al
                  afiliado.
                </Alert>
              )}

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Programar nueva fecha de baja:
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
                    label="Nueva fecha de baja"
                    type="date"
                    value={fechaBaja}
                    onChange={(e) => setFechaBaja(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              </Box>
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
                  {new Date(fechaBaja).toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })}.
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

        {afiliado?.baja && (
          <Button variant="outlined" color="success" onClick={handleCancelBaja}>
            Cancelar Baja
          </Button>
        )}

        <Button
          variant="contained"
          color={afiliado?.baja ? "warning" : "error"}
          onClick={handleConfirm}
          disabled={!esBajaInmediata && (!fechaBaja || esFechaPasada)}
        >
          {afiliado?.baja ? "Modificar Baja" : "Confirmar Baja"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
