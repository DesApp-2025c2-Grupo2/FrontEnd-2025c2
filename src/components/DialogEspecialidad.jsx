import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectEspecialidades } from '../store/especialidadesSlice';

export default function DialogEspecialidad({ abierto, valorInicial, onCerrar, onGuardar }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', activa: true });

  useEffect(() => {
    if (abierto) {
      setForm({
        nombre: valorInicial?.nombre ?? '',
        descripcion: valorInicial?.descripcion ?? '',
        activa: valorInicial?.activa ?? true,
        id: valorInicial?.id,
      });
    }
  }, [abierto, valorInicial]);

  const cambiar = (campo) => (e) => {
    const valor = campo === 'activa' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const especialidades = useSelector(selectEspecialidades);
  const errores = useMemo(() => {
    const errs = {};
    const nombreStr = String(form.nombre).trim().toLowerCase();
    if (!nombreStr) errs.nombre = 'Nombre requerido';
    const duplicado = especialidades?.some(e => e.id !== form.id && String(e.nombre).trim().toLowerCase() === nombreStr);
    if (duplicado) {
      errs.nombre = 'Nombre ya existente';
    }
    return errs;
  }, [especialidades, form]);

  const guardar = () => {
    if (Object.keys(errores).length) return;
    onGuardar?.({ ...form });
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, color: '#111827' }}>{form.id ? 'Editar especialidad' : 'Agregar especialidad'}</DialogTitle>
      <DialogContent
        dividers
        sx={{
          '& .MuiFormControlLabel-label': { fontWeight: 700, color: '#111827' },
          '& .MuiInputBase-input': { color: '#111827', fontWeight: 600 },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <TextField label="Nombre" value={form.nombre} onChange={cambiar('nombre')} fullWidth error={!!errores.nombre} helperText={errores.nombre} InputLabelProps={{ sx: { fontWeight: 700, color: '#111827' } }} inputProps={{ sx: { color: '#111827', fontWeight: 600 } }} />
          <TextField label="Descripción" value={form.descripcion} onChange={cambiar('descripcion')} fullWidth multiline rows={2} InputLabelProps={{ sx: { fontWeight: 700, color: '#111827' } }} inputProps={{ sx: { color: '#111827', fontWeight: 600 } }} />
          <FormControlLabel control={<Switch checked={!!form.activa} onChange={cambiar('activa')} />} label="Activa" />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar} sx={{ fontWeight: 700 }}>Cancelar</Button>
        <Button variant="contained" color="secondary" onClick={guardar} disabled={Object.keys(errores).length > 0} sx={{ fontWeight: 700 }}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}


