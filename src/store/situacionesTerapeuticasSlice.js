import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as situacionesService from '../services/situacionesService';

const initialState = { items: [], loading: false, error: null };

export const cargarSituaciones = createAsyncThunk('situaciones/cargar', async (_, { rejectWithValue }) => {
  try {
    const data = await situacionesService.getAll();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return rejectWithValue(e.message || 'Error al cargar situaciones');
  }
});

export const crearSituacion = createAsyncThunk('situaciones/crear', async (situacion, { rejectWithValue }) => {
  try {
    const created = await situacionesService.create(situacion);
    return created;
  } catch (e) {
    return rejectWithValue(e.message || 'No se pudo crear la situación');
  }
});

export const editarSituacion = createAsyncThunk('situaciones/editar', async (situacion, { rejectWithValue }) => {
  try {
    const updated = await situacionesService.update(situacion);
    return updated && updated.id ? updated : situacion;
  } catch (e) {
    return rejectWithValue(e.message || 'No se pudo actualizar la situación');
  }
});

// Eliminar situación: aún no utilizado en UI; se podrá reactivar cuando haya flujo de borrado

export const alternarSituacionThunk = createAsyncThunk('situaciones/alternar', async ({ id, activa }, { rejectWithValue }) => {
  try {
    const res = await situacionesService.toggle(id);
    const nuevaActiva = (res && (res.activa ?? res.activo)) !== undefined ? (res.activa ?? res.activo) : !activa;
    return { id, activa: !!nuevaActiva };
  } catch (e) {
    return rejectWithValue(e.message || 'No se pudo cambiar el estado de la situación');
  }
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
      .addCase(cargarSituaciones.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // crear
      .addCase(crearSituacion.pending, (state) => { state.error = null; })
      .addCase(crearSituacion.fulfilled, (state, action) => {
        const exists = state.items.some(s => s.id === action.payload.id);
        state.items = exists ? state.items : [action.payload, ...state.items];
      })
      .addCase(crearSituacion.rejected, (state, action) => { state.error = action.payload; })
      // editar
      .addCase(editarSituacion.pending, (state, action) => {
        state.error = null;
        const partial = action.meta?.arg;
        if (partial && partial.id) {
          state.items = state.items.map(s => s.id === partial.id ? { ...s, ...partial } : s);
        }
      })
      .addCase(editarSituacion.fulfilled, (state, action) => {
        const updated = action.payload;
        state.items = state.items.map(s => s.id === updated.id ? { ...s, ...updated } : s);
      })
      .addCase(editarSituacion.rejected, (state, action) => { state.error = action.payload; })
      // alternar activa
      .addCase(alternarSituacionThunk.pending, (state, action) => {
        state.error = null;
        const { id, activa } = action.meta?.arg || {};
        if (id !== undefined) {
          state.items = state.items.map(s => s.id === id ? { ...s, activa: !activa } : s);
        }
      })
      .addCase(alternarSituacionThunk.fulfilled, (state, action) => {
        const { id, activa } = action.payload;
        state.items = state.items.map(s => s.id === id ? { ...s, activa } : s);
      })
      .addCase(alternarSituacionThunk.rejected, (state, action) => {
        state.error = action.payload;
        const { id, activa } = action.meta?.arg || {};
        if (id !== undefined) {
          // rollback
          state.items = state.items.map(s => s.id === id ? { ...s, activa } : s);
        }
      });
  }
});

export const { } = slice.actions;

export const selectSituaciones = (state) => state.situaciones.items;
export const selectSituacionesLoading = (state) => state.situaciones.loading;
export const selectSituacionesError = (state) => state.situaciones.error;

export default slice.reducer;

