import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useSelector } from "react-redux";
import { selectPlanes } from "../store/planesSlice.js";

export default function DialogoPlan({
  abierto,
  valorInicial,
  onCerrar,
  onGuardar,
}) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    costoMensual: 0,
    moneda: 'ARS',
    activo: true,
  });

  useEffect(() => {
    if (abierto) {
      setForm({
        nombre: valorInicial?.nombre ?? "",
        descripcion: valorInicial?.descripcion ?? "",
        costoMensual: valorInicial?.costoMensual ?? 0,
        moneda: valorInicial?.moneda ?? 'ARS',
        activo: valorInicial?.activo ?? true,
        id: valorInicial?.id,
      });
    }
  }, [abierto, valorInicial]);

  const cambiar = (campo) => (e) => {
    const valor = campo === "activo" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const planes = useSelector(selectPlanes);
  const errores = useMemo(() => {
    const errs = {};
    const nombreStr = String(form.nombre).trim().toLowerCase();
    if (!nombreStr) errs.nombre = "Nombre requerido";
    const duplicado = planes?.some((p) => p.id !== form.id && String(p.nombre).trim().toLowerCase() === nombreStr);
    if (duplicado) errs.nombre = "Nombre ya existente";
    return errs;
  }, [planes, form]);

  const guardar = () => {
    if (Object.keys(errores).length) return;
    onGuardar?.({ ...form, costoMensual: Number(form.costoMensual) });
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, color: "#111827" }}>
        {form.id ? "Editar plan" : "Agregar plan"}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          "& .MuiFormControlLabel-label": { fontWeight: 700, color: "#111827" },
          "& .MuiInputBase-input": { color: "#111827", fontWeight: 600 },
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingTop: 8,
          }}
        >
          <TextField
            label="Nombre"
            value={form.nombre}
            onChange={cambiar("nombre")}
            fullWidth
            error={!!errores.nombre}
            helperText={errores.nombre}
            InputLabelProps={{ sx: { fontWeight: 700, color: "#111827" } }}
            inputProps={{ sx: { color: "#111827", fontWeight: 600 } }}
          />
          <TextField
            label="Descripción"
            value={form.descripcion}
            onChange={cambiar("descripcion")}
            fullWidth
            multiline
            rows={2}
            InputLabelProps={{ sx: { fontWeight: 700, color: "#111827" } }}
            inputProps={{ sx: { color: "#111827", fontWeight: 600 } }}
          />
          <TextField
            label="Costo mensual"
            value={form.costoMensual}
            onChange={cambiar("costoMensual")}
            type="number"
            fullWidth
            InputLabelProps={{ sx: { fontWeight: 700, color: "#111827" } }}
            inputProps={{ sx: { color: "#111827", fontWeight: 600 } }}
          />
          <TextField
            label="Moneda"
            value={form.moneda}
            onChange={cambiar("moneda")}
            fullWidth
            InputLabelProps={{ sx: { fontWeight: 700, color: "#111827" } }}
            inputProps={{ sx: { color: "#111827", fontWeight: 600 } }}
          />
          <FormControlLabel
            control={
              <Switch checked={!!form.activo} onChange={cambiar("activo")} />
            }
            label="Activo"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          variant="outlined"
          onClick={onCerrar}
          sx={{ fontWeight: 700 }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={guardar}
          disabled={Object.keys(errores).length > 0}
          sx={{ fontWeight: 700 }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
