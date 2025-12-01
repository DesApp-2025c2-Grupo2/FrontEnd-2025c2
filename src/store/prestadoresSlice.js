import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as prestadorService from "../services/prestadoresService";

// Async Thunks
export const fetchPrestadores = createAsyncThunk(
  "prestadores/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await prestadorService.getAll();
    } catch (error) {
      return rejectWithValue(error.message || "Error al obtener prestadores");
    }
  }
);

export const togglePrestadorStatus = createAsyncThunk(
  "prestadores/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      // Idealmente esto devuelve el prestador actualizado
      return await prestadorService.toggleStatus(id);
    } catch (error) {
      return rejectWithValue(
        error.message || "Error al cambiar estado del prestador"
      );
    }
  }
);

export const createPrestador = createAsyncThunk(
  "prestadores/create",
  async (prestadorData, { rejectWithValue }) => {
    try {
      // EL SERVICE SE ENCARGA DEL MAPEADO — NO EL SLICE
      return await prestadorService.saveNew(prestadorData);
    } catch (error) {
      return rejectWithValue(error.message || "Error al crear prestador");
    }
  }
);

export const updatePrestador = createAsyncThunk(
  "prestadores/update",
  async (prestadorData, { rejectWithValue }) => {
    try {
      return await prestadorService.update(prestadorData);
    } catch (error) {
      return rejectWithValue(error.message || "Error al actualizar prestador");
    }
  }
);

export const updateAgendaPrestador = createAsyncThunk(
  "prestadores/updateAgenda",
  async (agendaData, { rejectWithValue }) => {
    try {
      return await prestadorService.updateAgenda(agendaData);
    } catch (error) {
      return rejectWithValue(error.message || "Error al actualizar agenda");
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  currentPrestador: null,
};

const prestadoresSlice = createSlice({
  name: "prestadores",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPrestador: (state, action) => {
      state.currentPrestador = action.payload;
    },
    clearPrestadores: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchPrestadores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrestadores.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPrestadores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // TOGGLE STATUS
      .addCase(togglePrestadorStatus.fulfilled, (state, action) => {
        const prestadorId = action.meta.arg;
        const payload = action.payload;
        const index = state.items.findIndex((p) => p.id === prestadorId);
        if (index === -1) return;

        const actual = state.items[index];

        if (payload && typeof payload === "object") {
          // Caso ideal: el backend devolvió el prestador actualizado
          state.items[index] = payload;

          if (state.currentPrestador?.id === payload.id) {
            state.currentPrestador = payload;
          }
        } else {
          // Fallback: payload es boolean (activo / inactivo)
          const estaActivo = Boolean(payload);
          const actualizado = {
            ...actual,
            baja: estaActivo ? null : new Date().toISOString().split("T")[0],
          };

          state.items[index] = actualizado;

          if (state.currentPrestador?.id === actual.id) {
            state.currentPrestador = actualizado;
          }
        }
      })

      // CREATE
      .addCase(createPrestador.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createPrestador.rejected, (state, action) => {
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updatePrestador.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;

        if (state.currentPrestador?.id === action.payload.id)
          state.currentPrestador = action.payload;
      })
      .addCase(updatePrestador.rejected, (state, action) => {
        state.error = action.payload;
      })

      // UPDATE AGENDA
      .addCase(updateAgendaPrestador.fulfilled, (state, action) => {
        const updatedAgenda = action.payload; // { id, horarios }

        // Buscar el prestador que contiene esta agenda
        const prestador = state.items.find((p) =>
          p.agendas?.some((a) => a.id === updatedAgenda.id)
        );

        if (!prestador) return;

        // Reemplazar solo la agenda modificada
        prestador.agendas = prestador.agendas.map((a) =>
          a.id === updatedAgenda.id
            ? { ...a, horarios: updatedAgenda.horarios }
            : a
        );

        // También actualizar currentPrestador si está seleccionado
        if (state.currentPrestador?.id === prestador.id) {
          state.currentPrestador = { ...prestador };
        }
      });
  },
});

export const selectPrestadores = (state) => state.prestadores.items;
export const selectPrestadoresLoading = (state) => state.prestadores.loading;
export const selectPrestadoresError = (state) => state.prestadores.error;

export const { clearError, setCurrentPrestador, clearPrestadores } =
  prestadoresSlice.actions;

export default prestadoresSlice.reducer;
