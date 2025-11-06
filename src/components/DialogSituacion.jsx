import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectSituaciones } from '../store/situacionesTerapeuticasSlice.js';

export default function DialogSituacion({ abierto, valorInicial, onCerrar, onGuardar }) {
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

  const situaciones = useSelector(selectSituaciones);
  const errores = useMemo(() => {
    const errs = {};
    const nombreStr = String(form.nombre).trim().toLowerCase();
    if (!nombreStr) errs.nombre = 'Nombre requerido';
    const duplicado = situaciones?.some(s => s.id !== form.id && String(s.nombre).trim().toLowerCase() === nombreStr);
    if (duplicado) {
      errs.nombre = 'Nombre ya existente';
    }
    return errs;
  }, [situaciones, form]);

  const guardar = () => {
    if (Object.keys(errores).length) return;
    onGuardar?.({ ...form });
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, color: '#111827' }}>{form.id ? 'Editar situación' : 'Agregar situación'}</DialogTitle>
      <DialogContent
        dividers
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <TextField label="Nombre" value={form.nombre} onChange={cambiar('nombre')} fullWidth error={!!errores.nombre} helperText={errores.nombre} />
          <TextField label="Descripción" value={form.descripcion} onChange={cambiar('descripcion')} fullWidth multiline rows={3} />
          <FormControlLabel control={<Switch checked={!!form.activa} onChange={cambiar('activa')} color='secondary'/>} label="Activa" />
        </div>
      </DialogContent>
      <DialogActions>
        <Button color='secondary' variant='outlined' onClick={onCerrar}>Cancelar</Button>
        <Button variant="contained" color="secondary" onClick={guardar} disabled={Object.keys(errores).length > 0}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}



