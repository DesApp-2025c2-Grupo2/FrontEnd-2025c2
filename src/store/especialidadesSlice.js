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
      const data = await especialidadesService.ensureSeed();
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
      return res;
    } catch (e) {
      return rejectWithValue('Error al cambiar estado');
    }
  }
);

export const addEspecialidad = createAsyncThunk(
  'especialidades/add',
  async ({ nombre, descripcion }, { rejectWithValue, getState }) => {
    try {
      const created = await especialidadesService.create({ nombre, descripcion });
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
      return updated;
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
      .addCase(toggleEspecialidadStatus.pending, (state) => { state.error = null; })
      .addCase(toggleEspecialidadStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, activa } = action.payload;
        const esp = state.especialidades.find(e => e.id === id);
        if (esp) esp.activa = activa;
      })
      .addCase(toggleEspecialidadStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addEspecialidad.pending, (state) => { state.error = null; })
      .addCase(addEspecialidad.fulfilled, (state, action) => { state.loading = false; state.especialidades.push(action.payload); })
      .addCase(addEspecialidad.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateEspecialidad.pending, (state) => { state.error = null; })
      .addCase(updateEspecialidad.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.especialidades.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) state.especialidades[idx] = action.payload;
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


