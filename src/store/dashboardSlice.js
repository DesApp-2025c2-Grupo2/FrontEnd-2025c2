import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dashboardService } from "../services/dashboardService";

export const fetchEstadisticas = createAsyncThunk(
  "dashboard/fetchEstadisticas",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getEstadisticas();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    estadisticas: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetEstadisticas: (state) => {
      state.estadisticas = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEstadisticas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.loading = false;
        state.estadisticas = action.payload;
      })
      .addCase(fetchEstadisticas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetEstadisticas } = dashboardSlice.actions;

// Selectores
export const selectEstadisticas = (state) => state.dashboard.estadisticas;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

export default dashboardSlice.reducer;
