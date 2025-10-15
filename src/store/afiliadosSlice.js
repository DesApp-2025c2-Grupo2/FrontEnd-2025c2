import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllAfiliados,
  darBajaAfiliado as darBajaAfiliadoService,
  reactivarAfiliado as reactivarAfiliadoService,
  AfiliadosService,
} from "../services/afiliadosService";

// Async Thunks usando los servicios directos
export const fetchAfiliados = createAsyncThunk(
  "afiliados/fetchAfiliados",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllAfiliados();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createAfiliadoCompleto = createAsyncThunk(
  "afiliados/createAfiliadoCompleto",
  async (afiliadoData, { rejectWithValue }) => {
    try {
      const {
        formAfiliado,
        editTelefonos,
        editEmails,
        editDirecciones,
        editSituaciones,
      } = afiliadoData;
      return await AfiliadosService.createAfiliadoCompleto(
        formAfiliado,
        editTelefonos,
        editEmails,
        editDirecciones,
        editSituaciones
      );
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateAfiliadoCompleto = createAsyncThunk(
  "afiliados/updateAfiliadoCompleto",
  async (afiliadoData, { rejectWithValue }) => {
    try {
      const {
        selectedAfiliado,
        formAfiliado,
        editTelefonos,
        editEmails,
        editDirecciones,
        editSituaciones,
      } = afiliadoData;
      return await AfiliadosService.updateAfiliadoCompleto(
        selectedAfiliado,
        formAfiliado,
        editTelefonos,
        editEmails,
        editDirecciones,
        editSituaciones
      );
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const darBajaAfiliado = createAsyncThunk(
  "afiliados/darBajaAfiliado",
  async ({ afiliadoId, fechaBaja }, { rejectWithValue }) => {
    try {
      const result = await darBajaAfiliadoService(afiliadoId, fechaBaja);
      return { afiliadoId, fechaBaja, result };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const reactivarAfiliado = createAsyncThunk(
  "afiliados/reactivarAfiliado",
  async (afiliadoId, { rejectWithValue }) => {
    try {
      const result = await reactivarAfiliadoService(afiliadoId);
      return { afiliadoId, result };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  afiliados: [],
  loading: false,
  error: null,
  currentAfiliado: null,
};

const afiliadosSlice = createSlice({
  name: "afiliados",
  initialState,
  reducers: {
    setCurrentAfiliado: (state, action) => {
      state.currentAfiliado = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Acciones sync del slice original
    addAfiliado: (state, action) => {
      state.afiliados.unshift(action.payload);
    },
    updateAfiliadoLocal: (state, action) => {
      const idx = state.afiliados.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1)
        state.afiliados[idx] = { ...state.afiliados[idx], ...action.payload };
    },
    setBajaAfiliado: (state, action) => {
      const { afiliadoId, fechaBaja } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) afiliado.baja = fechaBaja;
    },
    cancelBajaAfiliado: (state, action) => {
      const afiliado = state.afiliados.find((a) => a.id === action.payload);
      if (afiliado) afiliado.baja = null;
    },
    updatePlanMedicoAfiliado: (state, action) => {
      const { afiliadoId, planMedicoId } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) afiliado.planMedicoId = planMedicoId;
    },

    // Acciones para altas programadas
    programarAltaAfiliado: (state, action) => {
      const { afiliadoId, fechaAlta } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.baja = null;
        afiliado.alta = fechaAlta;
      }
    },
    cancelarAltaProgramada: (state, action) => {
      const { afiliadoId, fechaAltaInmediata } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado && fechaAltaInmediata) afiliado.alta = fechaAltaInmediata;
    },

    // Acción de reactivación sync (adicional al async thunk)
    reactivarAfiliadoSync: (state, action) => {
      const { afiliadoId } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        const hoyISO = new Date().toISOString().split("T")[0];
        afiliado.baja = null;
        afiliado.alta = hoyISO;
      }
    },

    // Acciones para situaciones terapéuticas
    addSituacionAfiliado: (state, action) => {
      const { afiliadoId, situacionNombre } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        const exists = afiliado.situacionesTerapeuticas?.some(
          (s) => s?.toLowerCase?.() === String(situacionNombre).toLowerCase()
        );
        if (!exists) {
          afiliado.situacionesTerapeuticas = [
            ...(afiliado.situacionesTerapeuticas || []),
            situacionNombre,
          ];
        }
      }
    },
    removeSituacionAfiliado: (state, action) => {
      const { afiliadoId, index } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.situacionesTerapeuticas = (
          afiliado.situacionesTerapeuticas || []
        ).filter((_, i) => i !== index);
      }
    },
    setSituacionesAfiliado: (state, action) => {
      const { afiliadoId, situaciones } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) afiliado.situacionesTerapeuticas = situaciones || [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Afiliados
      .addCase(fetchAfiliados.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAfiliados.fulfilled, (state, action) => {
        state.loading = false;
        console.log("=== Afiliados recibidos del backend ===", action.payload);
        state.afiliados = action.payload;
      })
      .addCase(fetchAfiliados.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("=== Error cargando afiliados ===", action.payload);
      })
      // Create Afiliado Completo
      .addCase(createAfiliadoCompleto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAfiliadoCompleto.fulfilled, (state, action) => {
        state.loading = false;
        state.afiliados.unshift(action.payload.afiliado);
      })
      .addCase(createAfiliadoCompleto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Afiliado Completo
      .addCase(updateAfiliadoCompleto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAfiliadoCompleto.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.afiliados.findIndex(
          (a) => a.id === action.payload.afiliado.id
        );
        if (index !== -1) {
          state.afiliados[index] = action.payload.afiliado;
        }
      })
      .addCase(updateAfiliadoCompleto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Dar Baja Afiliado
      .addCase(darBajaAfiliado.fulfilled, (state, action) => {
        const { afiliadoId, fechaBaja } = action.payload;
        const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
        if (afiliado) afiliado.baja = fechaBaja;
      })
      // Reactivar Afiliado
      .addCase(reactivarAfiliado.fulfilled, (state, action) => {
        const { afiliadoId } = action.payload;
        const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
        if (afiliado) afiliado.baja = null;
      });
  },
});

// Exportar TODAS las acciones que necesitas
export const {
  setCurrentAfiliado,
  clearError,
  addAfiliado,
  updateAfiliadoLocal,
  setBajaAfiliado,
  cancelBajaAfiliado,
  programarAltaAfiliado,
  cancelarAltaProgramada,
  reactivarAfiliadoSync,
  updatePlanMedicoAfiliado,
  addSituacionAfiliado,
  removeSituacionAfiliado,
  setSituacionesAfiliado,
} = afiliadosSlice.actions;

export const selectAfiliados = (state) => state.afiliados.afiliados;
export const selectAfiliadosLoading = (state) => state.afiliados.loading;
export const selectAfiliadosError = (state) => state.afiliados.error;
export const selectCurrentAfiliado = (state) => state.afiliados.currentAfiliado;

export default afiliadosSlice.reducer;
