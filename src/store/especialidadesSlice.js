import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as especialidadesService from '../services/especialidadesService';

const initialState = {
  especialidades: [],
  loading: false,
  error: null,
};

export const cargarEspecialidades = createAsyncThunk(
  'especialidades/cargar',
  async (_, { rejectWithValue }) => {
    try {
      const data = await especialidadesService.getAll();
      return data;
    } catch (e) {
      return rejectWithValue(e.message || 'Error al cargar');
    }
  }
);

export const toggleEspecialidadStatus = createAsyncThunk(
  'especialidades/toggleStatus',
  async ({ id, activa }, { rejectWithValue }) => {
    try {
      const res = await especialidadesService.toggle(id);
      // Normalizar siempre a { id, activa } para desacoplar del backend
      const nuevaActiva = (res && (res.activa ?? res.activo)) !== undefined
        ? (res.activa ?? res.activo)
        : !activa;
      return { id, activa: !!nuevaActiva };
    } catch (e) {
      return rejectWithValue('Error al cambiar estado');
    }
  }
);

export const addEspecialidad = createAsyncThunk(
  'especialidades/add',
  async ({ nombre, descripcion, activa }, { rejectWithValue }) => {
    try {
      const created = await especialidadesService.create({ nombre, descripcion, activa });
      return created;
    } catch (e) {
      return rejectWithValue(e.message || 'Error al agregar');
    }
  }
);

export const updateEspecialidad = createAsyncThunk(
  'especialidades/update',
  async (partial, { rejectWithValue }) => {
    try {
      const updated = await especialidadesService.update(partial);
      // Fallback si el backend no devuelve el objeto completo
      return updated && updated.id ? updated : partial;
    } catch (e) {
      return rejectWithValue(e.message || 'Error al actualizar');
    }
  }
);


const slice = createSlice({
  name: 'especialidades',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(cargarEspecialidades.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(cargarEspecialidades.fulfilled, (state, action) => { state.loading = false; state.especialidades = action.payload || []; })
      .addCase(cargarEspecialidades.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(toggleEspecialidadStatus.pending, (state, action) => {
        state.error = null;
        const { id, activa } = action.meta?.arg || {};
        if (id !== undefined) {
          // Optimista: invertir en memoria
          state.especialidades = state.especialidades.map(e =>
            e.id === id ? { ...e, activa: !activa } : e
          );
        }
      })
      .addCase(toggleEspecialidadStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, activa } = action.payload;
        state.especialidades = state.especialidades.map(e =>
          e.id === id ? { ...e, activa } : e
        );
      })
      .addCase(toggleEspecialidadStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        const { id, activa } = action.meta?.arg || {};
        if (id !== undefined) {
          // Rollback
          state.especialidades = state.especialidades.map(e =>
            e.id === id ? { ...e, activa } : e
          );
        }
      })
      .addCase(addEspecialidad.pending, (state) => { state.error = null; })
      .addCase(addEspecialidad.fulfilled, (state, action) => { state.loading = false; state.especialidades.push(action.payload); })
      .addCase(addEspecialidad.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateEspecialidad.pending, (state, action) => {
        state.error = null;
        const partial = action.meta?.arg;
        if (partial && partial.id) {
          // Optimista: aplicar cambios enviados
          state.especialidades = state.especialidades.map(e =>
            e.id === partial.id ? { ...e, ...partial } : e
          );
        }
      })
      .addCase(updateEspecialidad.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.especialidades = state.especialidades.map(e =>
          e.id === updated.id ? { ...e, ...updated } : e
        );
      })
      .addCase(updateEspecialidad.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const selectEspecialidades = (state) => state.especialidades.especialidades;
export const selectLoading = (state) => state.especialidades.loading;
export const selectError = (state) => state.especialidades.error;

export const selectEspecialidadesFiltradas = createSelector(
  [selectEspecialidades],
  (especialidades) => especialidades
);

export default slice.reducer;


