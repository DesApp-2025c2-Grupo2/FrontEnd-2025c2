import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AfiliadosService } from "../services/AfiliadosService";

// --- Async Thunks ---
export const fetchAfiliados = createAsyncThunk(
  "afiliados/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await AfiliadosService.getAll();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createAfiliado = createAsyncThunk(
  "afiliados/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await AfiliadosService.create(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateAfiliado = createAsyncThunk(
  "afiliados/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await AfiliadosService.update(id, payload);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteAfiliado = createAsyncThunk(
  "afiliados/delete",
  async (id, { rejectWithValue }) => {
    try {
      await AfiliadosService.delete(id);
      // devolvemos el id para simplificar el extraReducer
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const toggleAfiliadoStatus = createAsyncThunk(
  "afiliados/toggleStatus",
  async ({ id, activo, fecha }, { rejectWithValue }) => {
    try {
      return await AfiliadosService.toggleStatus(id, activo, fecha);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// --- Slice ---
const afiliadosSlice = createSlice({
  name: "afiliados",
  initialState: {
    lista: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectAfiliado: (state, action) => {
      state.selected = action.payload;
    },
    clearSelected: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAfiliados
      .addCase(fetchAfiliados.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAfiliados.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchAfiliados.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("=== Error cargando afiliados ===", action.payload);
      })

      // createAfiliado
      .addCase(createAfiliado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAfiliado.fulfilled, (state, action) => {
        state.loading = false;
        // push created afiliado to lista
        state.lista.push(action.payload);
      })
      .addCase(createAfiliado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateAfiliado
      .addCase(updateAfiliado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAfiliado.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lista.findIndex((a) => a.id === action.payload.id);
        if (index >= 0) state.lista[index] = action.payload;
        if (state.selected?.id === action.payload.id)
          state.selected = action.payload;
      })
      .addCase(updateAfiliado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteAfiliado
      .addCase(deleteAfiliado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAfiliado.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload === id
        state.lista = state.lista.filter((a) => a.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deleteAfiliado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleAfiliadoStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleAfiliadoStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lista.findIndex((a) => a.id === action.payload.id);
        if (index >= 0) state.lista[index] = action.payload;
        if (state.selected?.id === action.payload.id)
          state.selected = action.payload;
      })
      .addCase(toggleAfiliadoStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectAfiliado, clearSelected } = afiliadosSlice.actions;
export default afiliadosSlice.reducer;
