import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit';
import * as situacionesService from '../services/situacionesService';

const seedSituaciones = [
  { id: '101', nombre: 'Diabetes Tipo 2', descripcion: 'Tratamiento y seguimiento de diabetes mellitus tipo 2', activa: false },
  { id: '102', nombre: 'Hipertensión Arterial', descripcion: 'Control y monitoreo de presión arterial elevada', activa: true },
  { id: '103', nombre: 'Rehabilitación Cardíaca', descripcion: 'Programa de rehabilitación post-infarto o cirugía cardiaca', activa: true },
  { id: '104', nombre: 'Terapia Oncológica', descripcion: 'Tratamiento y seguimiento de pacientes oncológicos', activa: false },
];

const initialState = {
  items: seedSituaciones,
  loading: false,
  error: null,
};

export const cargarSituaciones = createAsyncThunk('situaciones/cargar', async () => {
  const data = await situacionesService.ensureSeed(initialState.items);
  const fixed = data.map((s) => ({
    id: s.id || nanoid(),
    nombre: s.nombre,
    descripcion: s.descripcion || '',
    activa: s.activa ?? true,
  }));
  const changed = JSON.stringify(data) !== JSON.stringify(fixed);
  if (changed) {
    await situacionesService.overwriteAll(fixed);
  }
  return fixed;
});

export const crearSituacion = createAsyncThunk('situaciones/crear', async (situacion) => {
  const payload = {
    id: situacion.id || nanoid(),
    nombre: situacion.nombre,
    descripcion: situacion.descripcion || '',
    activa: situacion.activa ?? true,
  };
  const created = await situacionesService.createSituacion(payload);
  return created;
});

export const editarSituacion = createAsyncThunk('situaciones/editar', async (situacion) => {
  const updated = await situacionesService.updateSituacion(situacion);
  return updated;
});

// Eliminar situación: aún no utilizado en UI; se podrá reactivar cuando haya flujo de borrado

export const alternarSituacionThunk = createAsyncThunk('situaciones/alternar', async (id) => {
  const updated = await situacionesService.toggleSituacion(id);
  return updated;
});

const slice = createSlice({
  name: 'situaciones',
  initialState,
  reducers: {
    // Reducers sin uso por ahora
  },
  extraReducers: (builder) => {
    builder
      // cargar
      .addCase(cargarSituaciones.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(cargarSituaciones.fulfilled, (state, action) => { state.loading = false; state.items = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(cargarSituaciones.rejected, (state, action) => { state.loading = false; state.error = action.error?.message || 'Error al cargar situaciones'; })
      // crear
      .addCase(crearSituacion.pending, (state) => { state.error = null; })
      .addCase(crearSituacion.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(crearSituacion.rejected, (state, action) => { state.error = action.error?.message || 'No se pudo crear la situación'; })
      // editar
      .addCase(editarSituacion.pending, (state) => { state.error = null; })
      .addCase(editarSituacion.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(editarSituacion.rejected, (state, action) => { state.error = action.error?.message || 'No se pudo actualizar la situación'; })
      // alternar activa
      .addCase(alternarSituacionThunk.pending, (state) => { state.error = null; })
      .addCase(alternarSituacionThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(alternarSituacionThunk.rejected, (state, action) => { state.error = action.error?.message || 'No se pudo cambiar el estado de la situación'; });
  }
});

export const { } = slice.actions;

export const selectSituaciones = (state) => state.situaciones.items;
export const selectSituacionesLoading = (state) => state.situaciones.loading;
export const selectSituacionesError = (state) => state.situaciones.error;

export default slice.reducer;

