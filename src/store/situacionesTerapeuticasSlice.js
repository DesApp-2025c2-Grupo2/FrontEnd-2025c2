import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialSituaciones = [
  { id: 101, nombre: 'Diabetes Tipo 2', descripcion: 'Tratamiento y seguimiento de diabetes mellitus tipo 2', activa: false },
  { id: 102, nombre: 'Hipertensión Arterial', descripcion: 'Control y monitoreo de presión arterial elevada', activa: true },
  { id: 103, nombre: 'Rehabilitación Cardíaca', descripcion: 'Programa de rehabilitación post-infarto o cirugía cardiaca', activa: true },
  { id: 104, nombre: 'Terapia Oncológica', descripcion: 'Tratamiento y seguimiento de pacientes oncológicos', activa: false },
];

const initialState = {
  situaciones: initialSituaciones,
  loading: false,
  error: null,
};

export const toggleSituacionStatus = createAsyncThunk(
  'situaciones/toggleStatus',
  async ({ id, activa }, { rejectWithValue }) => {
    try {
      await new Promise(r => setTimeout(r, 400));
      return { id, activa: !activa };
    } catch (e) {
      return rejectWithValue('Error al cambiar estado');
    }
  }
);

export const addSituacion = createAsyncThunk(
  'situaciones/add',
  async ({ nombre, descripcion }, { rejectWithValue }) => {
    try {
      await new Promise(r => setTimeout(r, 300));
      return { id: Date.now(), nombre, descripcion, activa: true };
    } catch (e) {
      return rejectWithValue('Error al agregar');
    }
  }
);

const slice = createSlice({
  name: 'situaciones',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleSituacionStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(toggleSituacionStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, activa } = action.payload;
        const s = state.situaciones.find(x => x.id === id);
        if (s) s.activa = activa;
      })
      .addCase(toggleSituacionStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addSituacion.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addSituacion.fulfilled, (state, action) => { state.loading = false; state.situaciones.push(action.payload); })
      .addCase(addSituacion.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const selectSituaciones = (state) => state.situaciones.situaciones;
export const selectSituacionesLoading = (state) => state.situaciones.loading;
export const selectSituacionesError = (state) => state.situaciones.error;

export default slice.reducer;


