import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reportesService from '../services/reportesService';

// Tipos de reportes disponibles
export const TIPOS_REPORTES = [
  {
    id: 'alta-afiliados-periodo',
    nombre: 'Alta de Afiliados por Período',
    descripcion: 'Reporte de nuevos afiliados registrados en un período específico'
  },
  {
    id: 'alta-prestadores-periodo',
    nombre: 'Alta de Prestadores por Período',
    descripcion: 'Reporte de nuevos prestadores registrados en un período específico'
  },
  {
    id: 'prestadores-especialidad-cp',
    nombre: 'Prestadores por Especialidad y CP',
    descripcion: 'Distribución de prestadores por especialidad y código postal'
  },
  {
    id: 'situaciones-terapeuticas-afiliado',
    nombre: 'Situaciones Terapéuticas por Afiliado',
    descripcion: 'Reporte de situaciones terapéuticas por afiliado'
  },
  {
    id: 'prestadores-sin-agendas',
    nombre: 'Prestadores sin Agendas',
    descripcion: 'Listado de prestadores que no tienen agendas configuradas'
  }
];

// Datos iniciales (seed data) para el historial
const seedReportes = [
  {
    id: 1,
    tipoReporte: 'alta-afiliados-periodo',
    nombre: 'Alta de Afiliados por Período',
    fechaGeneracion: '2024-01-15T14:30:00Z',
    fechaExportacion: '2024-01-15T14:35:00Z',
    parametros: {
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-01-15'
    },
    estado: 'completado',
    formatoExportacion: 'PDF'
  },
  {
    id: 2,
    tipoReporte: 'prestadores-especialidad-cp',
    nombre: 'Prestadores por Especialidad y CP',
    fechaGeneracion: '2024-01-14T09:15:00Z',
    fechaExportacion: '2024-01-14T09:20:00Z',
    parametros: {
      especialidades: ['Cardiología', 'Traumatología'],
      codigosPostales: ['1000', '2000']
    },
    estado: 'completado',
    formatoExportacion: 'Excel'
  },
  {
    id: 3,
    tipoReporte: 'prestadores-sin-agendas',
    nombre: 'Prestadores sin Agendas',
    fechaGeneracion: '2024-01-13T16:45:00Z',
    fechaExportacion: null,
    parametros: {},
    estado: 'generado',
    formatoExportacion: null
  }
];

const initialState = {
  tiposReportes: TIPOS_REPORTES,
  reporteSeleccionado: null,
  historialReportes: seedReportes,
  loading: false,
  error: null,
  generandoReporte: false,
  exportandoReporte: false
};

// Thunks asíncronos
export const generarReporte = createAsyncThunk(
  'reportes/generar',
  async ({ tipoReporte, parametros }, { rejectWithValue }) => {
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nuevoReporte = await reportesService.generarReporte({
        tipoReporte,
        parametros,
        fechaGeneracion: new Date().toISOString()
      });
      
      return nuevoReporte;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al generar reporte');
    }
  }
);

export const exportarReporte = createAsyncThunk(
  'reportes/exportar',
  async ({ reporteId, formato }, { rejectWithValue }) => {
    try {
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reporteExportado = await reportesService.exportarReporte({
        reporteId,
        formato,
        fechaExportacion: new Date().toISOString()
      });
      
      return reporteExportado;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al exportar reporte');
    }
  }
);

export const cargarHistorialReportes = createAsyncThunk(
  'reportes/cargarHistorial',
  async (_, { rejectWithValue }) => {
    try {
      const historial = await reportesService.getHistorialReportes();
      return historial;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar historial');
    }
  }
);

const reportesSlice = createSlice({
  name: 'reportes',
  initialState,
  reducers: {
    seleccionarTipoReporte: (state, action) => {
      state.reporteSeleccionado = action.payload;
    },
    limpiarError: (state) => {
      state.error = null;
    },
    limpiarSeleccion: (state) => {
      state.reporteSeleccionado = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generar reporte
      .addCase(generarReporte.pending, (state) => {
        state.generandoReporte = true;
        state.error = null;
      })
      .addCase(generarReporte.fulfilled, (state, action) => {
        state.generandoReporte = false;
        state.historialReportes.unshift(action.payload);
        state.reporteSeleccionado = null; // Limpiar selección después de generar
      })
      .addCase(generarReporte.rejected, (state, action) => {
        state.generandoReporte = false;
        state.error = action.payload;
      })
      
      // Exportar reporte
      .addCase(exportarReporte.pending, (state) => {
        state.exportandoReporte = true;
        state.error = null;
      })
      .addCase(exportarReporte.fulfilled, (state, action) => {
        state.exportandoReporte = false;
        // Actualizar el reporte en el historial con la fecha de exportación
        const index = state.historialReportes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.historialReportes[index] = action.payload;
        }
      })
      .addCase(exportarReporte.rejected, (state, action) => {
        state.exportandoReporte = false;
        state.error = action.payload;
      })
      
      // Cargar historial
      .addCase(cargarHistorialReportes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarHistorialReportes.fulfilled, (state, action) => {
        state.loading = false;
        // Asegurar que sea un array y filtrar reportes eliminados
        const payload = Array.isArray(action.payload) ? action.payload : [];
        state.historialReportes = payload.filter(r => r.tipoReporte !== 'horarios-sin-turnos');
      })
      .addCase(cargarHistorialReportes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { seleccionarTipoReporte, limpiarError, limpiarSeleccion } = reportesSlice.actions;

// Selectores
export const selectTiposReportes = (state) => state.reportes.tiposReportes;
export const selectReporteSeleccionado = (state) => state.reportes.reporteSeleccionado;
export const selectHistorialReportes = (state) => state.reportes.historialReportes;
export const selectLoading = (state) => state.reportes.loading;
export const selectError = (state) => state.reportes.error;
export const selectGenerandoReporte = (state) => state.reportes.generandoReporte;
export const selectExportandoReporte = (state) => state.reportes.exportandoReporte;

export default reportesSlice.reducer;
