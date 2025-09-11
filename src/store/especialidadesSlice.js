import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

const initialEspecialidades = [
  { id: 1, nombre: 'Cardiología', descripcion: 'Especialidad médica que se ocupa del corazón', activa: false },
  { id: 2, nombre: 'Traumatología', descripcion: 'Trata lesiones del sistema musculoesquelético', activa: true },
  { id: 3, nombre: 'Medicina General', descripcion: 'Atención médica integral y continua', activa: true },
  { id: 4, nombre: 'Pediatría', descripcion: 'Salud de bebés, niños y adolescentes', activa: true },
];

const initialState = {
  especialidades: initialEspecialidades,
  loading: false,
  error: null,
};

export const toggleEspecialidadStatus = createAsyncThunk(
  'especialidades/toggleStatus',
  async ({ id, activa }, { rejectWithValue }) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      return { id, activa: !activa };
    } catch (e) {
      return rejectWithValue('Error al cambiar estado');
    }
  }
);

export const addEspecialidad = createAsyncThunk(
  'especialidades/add',
  async ({ nombre, descripcion }, { rejectWithValue, getState }) => {
    try {
      await new Promise(r => setTimeout(r, 400));
    
      const state = getState();
      const maxId = Math.max(...state.especialidades.especialidades.map(e => e.id), 0);
      const newId = maxId + 1;
      
      return { id: newId, nombre, descripcion, activa: true };
    } catch (e) {
      return rejectWithValue('Error al agregar');
    }
  }
);

const slice = createSlice({
  name: 'especialidades',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleEspecialidadStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(toggleEspecialidadStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, activa } = action.payload;
        const esp = state.especialidades.find(e => e.id === id);
        if (esp) esp.activa = activa;
      })
      .addCase(toggleEspecialidadStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addEspecialidad.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addEspecialidad.fulfilled, (state, action) => { state.loading = false; state.especialidades.push(action.payload); })
      .addCase(addEspecialidad.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
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


