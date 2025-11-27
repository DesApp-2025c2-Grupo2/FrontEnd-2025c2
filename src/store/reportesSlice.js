import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as reportesService from "../services/reportesService";

export const TIPOS_REPORTES = [
  {
    id: "alta-afiliados-periodo",
    nombre: "Alta de Afiliados por Período",
    descripcion:
      "Reporte de nuevos afiliados registrados en un período específico",
  },
  {
    id: "alta-prestadores-periodo",
    nombre: "Alta de Prestadores por Período",
    descripcion:
      "Reporte de nuevos prestadores registrados en un período específico",
  },
  {
    id: "prestadores-especialidad-cp",
    nombre: "Prestadores por Especialidad y CP",
    descripcion: "Distribución de prestadores por especialidad y código postal",
  },
  {
    id: "situaciones-terapeuticas-afiliado",
    nombre: "Situaciones Terapéuticas por Afiliado",
    descripcion: "Reporte de situaciones terapéuticas por afiliado",
  },
  {
    id: "prestadores-sin-agendas",
    nombre: "Prestadores sin Agendas",
    descripcion: "Listado de prestadores que no tienen agendas configuradas",
  },
];

const initialState = {
  tiposReportes: TIPOS_REPORTES,
  reporteSeleccionado: null,
  historialReportes: [],
  loading: false,
  error: null,
  generandoReporte: false,
  exportandoReporte: false,
};

export const generarReporte = createAsyncThunk(
  "reportes/generar",
  async ({ tipoReporte, parametros }, { rejectWithValue }) => {
    try {
      return await reportesService.generarReporte({
        tipoReporte,
        parametros,
        fechaGeneracion: new Date().toISOString(),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Error al generar reporte");
    }
  }
);

export const exportarReporte = createAsyncThunk(
  "reportes/exportar",
  async ({ reporteId, formato, tipoReporte }, { rejectWithValue }) => {
    try {
      return await reportesService.exportarReporte({
        reporteId,
        formato,
        tipoReporte,
      });
    } catch (error) {
      return rejectWithValue(error.message || "Error al exportar reporte");
    }
  }
);

export const cargarHistorialReportes = createAsyncThunk(
  "reportes/cargarHistorial",
  async (_, { rejectWithValue }) => {
    try {
      return await reportesService.getHistorialReportes();
    } catch (error) {
      return rejectWithValue(error.message || "Error al cargar historial");
    }
  }
);

const reportesSlice = createSlice({
  name: "reportes",
  initialState,
  reducers: {
    seleccionarTipoReporte: (state, action) => {
      state.reporteSeleccionado = action.payload;
    },
    limpiarError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generarReporte.pending, (state) => {
        state.generandoReporte = true;
        state.error = null;
      })
      .addCase(generarReporte.fulfilled, (state) => {
        state.generandoReporte = false;
      })
      .addCase(generarReporte.rejected, (state, action) => {
        state.generandoReporte = false;
        state.error = action.payload;
      })

      .addCase(exportarReporte.pending, (state) => {
        state.exportandoReporte = true;
        state.error = null;
      })
      .addCase(exportarReporte.fulfilled, (state, action) => {
        state.exportandoReporte = false;
      })
      .addCase(exportarReporte.rejected, (state, action) => {
        state.exportandoReporte = false;
        state.error = action.payload;
      })

      .addCase(cargarHistorialReportes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarHistorialReportes.fulfilled, (state, action) => {
        state.loading = false;
        state.historialReportes = action.payload || [];
      })
      .addCase(cargarHistorialReportes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { seleccionarTipoReporte, limpiarError } = reportesSlice.actions;

export const selectTiposReportes = (state) => state.reportes.tiposReportes;
export const selectReporteSeleccionado = (state) =>
  state.reportes.reporteSeleccionado;
export const selectHistorialReportes = (state) =>
  state.reportes.historialReportes;
export const selectLoading = (state) => state.reportes.loading;
export const selectError = (state) => state.reportes.error;
export const selectGenerandoReporte = (state) =>
  state.reportes.generandoReporte;
export const selectExportandoReporte = (state) =>
  state.reportes.exportandoReporte;

export default reportesSlice.reducer;
