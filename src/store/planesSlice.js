import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as planesService from '../services/planesService';

const initialState = { items: [], filtro: '', loading: false, error: null };

export const cargarPlanes = createAsyncThunk('planes/cargar', async (_, { rejectWithValue }) => {
  try {
    const data = await planesService.getAll();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return rejectWithValue(e.message || 'Error al cargar planes');
  }
});

export const crearPlan = createAsyncThunk('planes/crear', async (plan, { rejectWithValue }) => {
  try {
    const created = await planesService.create(plan);
    return created;
  } catch (e) {
    return rejectWithValue(e.message || 'No se pudo crear el plan');
  }
});

export const editarPlan = createAsyncThunk('planes/editar', async (plan, { rejectWithValue }) => {
  try {
    const updated = await planesService.update(plan);
    return updated && updated.id ? updated : plan;
  } catch (e) {
    return rejectWithValue(e.message || 'No se pudo actualizar el plan');
  }
});

export const eliminarPlanThunk = createAsyncThunk('planes/eliminar', async (id, { rejectWithValue }) => {
  try {
    await planesService.deletePlan(id);
    return id;
  } catch (e) {
    return rejectWithValue(e.message || 'No se pudo eliminar el plan');
  }
});

export const alternarPlanThunk = createAsyncThunk('planes/alternar', async ({ id, activo }, { rejectWithValue }) => {
  try {
    const res = await planesService.toggle(id);
    const nuevoActivo = (res && (res.activo ?? res.activa)) !== undefined ? (res.activo ?? res.activa) : !activo;
    return { id, activo: !!nuevoActivo };
  } catch (e) {
    return rejectWithValue(e.message || 'No se pudo cambiar el estado del plan');
  }
});

const planesSlice = createSlice({
  name: 'planes',
  initialState,
  reducers: {
    setFiltro(state, action) {
      state.filtro = action.payload || '';
    },
    // Reducers locales (filtro)
  },
  extraReducers: (builder) => {
    builder
      // cargar
      .addCase(cargarPlanes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarPlanes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(cargarPlanes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Error al cargar planes';
      })
      // crear
      .addCase(crearPlan.pending, (state) => { state.error = null; })
      .addCase(crearPlan.fulfilled, (state, action) => {
        // Evitar duplicados por id
        const exists = state.items.some(p => p.id === action.payload.id);
        state.items = exists ? state.items : [action.payload, ...state.items];
      })
      .addCase(crearPlan.rejected, (state, action) => {
        state.error = action.payload || 'No se pudo crear el plan';
      })
      // editar
      .addCase(editarPlan.pending, (state, action) => {
        state.error = null;
        const partial = action.meta?.arg;
        if (partial && partial.id) {
          state.items = state.items.map(p => p.id === partial.id ? { ...p, ...partial } : p);
        }
      })
      .addCase(editarPlan.fulfilled, (state, action) => {
        const updated = action.payload;
        state.items = state.items.map(p => p.id === updated.id ? { ...p, ...updated } : p);
      })
      .addCase(editarPlan.rejected, (state, action) => { state.error = action.payload || 'No se pudo actualizar el plan'; })
      // eliminar
      .addCase(eliminarPlanThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(eliminarPlanThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(eliminarPlanThunk.rejected, (state, action) => { state.error = action.payload || 'No se pudo eliminar el plan'; })
      // alternar activo
      .addCase(alternarPlanThunk.pending, (state, action) => {
        state.error = null;
        const { id, activo } = action.meta?.arg || {};
        if (id !== undefined) {
          state.items = state.items.map(p => p.id === id ? { ...p, activo: !activo } : p);
        }
      })
      .addCase(alternarPlanThunk.fulfilled, (state, action) => {
        const { id, activo } = action.payload;
        state.items = state.items.map(p => p.id === id ? { ...p, activo } : p);
      })
      .addCase(alternarPlanThunk.rejected, (state, action) => {
        state.error = action.payload || 'No se pudo cambiar el estado del plan';
        const { id, activo } = action.meta?.arg || {};
        if (id !== undefined) {
          // rollback
          state.items = state.items.map(p => p.id === id ? { ...p, activo } : p);
        }
      });
  }
});

export const { setFiltro } = planesSlice.actions;

export const selectPlanes = state => state.planes.items;
export const selectFiltro = state => state.planes.filtro;
export const selectPlanesFiltrados = state => {
  const filtro = (state.planes.filtro || '').toLowerCase();
  if (!filtro) return state.planes.items;
  return state.planes.items.filter(p =>
    [p.nombre, String(p.codigo), p.descripcion]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(filtro))
  );
};

export default planesSlice.reducer;


