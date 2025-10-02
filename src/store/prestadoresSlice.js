import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as prestadoresService from '../services/prestadoresService';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

// Thunks asíncronos
export const cargarPrestadores = createAsyncThunk(
  'prestadores/cargar',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Inicializar seed si hace falta y devolver datos
      const data = await prestadoresService.ensureSeed();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar prestadores');
    }
  }
);

export const crearPrestador = createAsyncThunk(
  'prestadores/crear',
  async (prestador, { rejectWithValue, getState }) => {
    try {
      const creado = await prestadoresService.create(prestador);
      return creado;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al crear prestador');
    }
  }
);

export const editarPrestador = createAsyncThunk(
  'prestadores/editar',
  async (prestador, { rejectWithValue }) => {
    try {
      const actualizado = await prestadoresService.update(prestador);
      return actualizado;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al editar prestador');
    }
  }
);

export const eliminarPrestador = createAsyncThunk(
  'prestadores/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await prestadoresService.deleteById(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al eliminar prestador');
    }
  }
);

export const toggleActivoPrestador = createAsyncThunk(
  'prestadores/toggleActivo',
  async (id, { rejectWithValue, getState }) => {
    try {
      const result = await prestadoresService.toggleActivo(id);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cambiar estado');
    }
  }
);

const slice = createSlice({
  name: 'prestadores',
  initialState,
  reducers: {
    limpiarError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Cargar prestadores
      .addCase(cargarPrestadores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarPrestadores.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(cargarPrestadores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar prestadores';
      })
      
      // Crear prestador
      .addCase(crearPrestador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearPrestador.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(crearPrestador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'No se pudo crear el prestador';
      })
      
      // Editar prestador
      .addCase(editarPrestador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editarPrestador.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(editarPrestador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'No se pudo actualizar el prestador';
      })
      
      // Eliminar prestador
      .addCase(eliminarPrestador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(eliminarPrestador.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(eliminarPrestador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'No se pudo eliminar el prestador';
      })
      
      // Toggle activo
      .addCase(toggleActivoPrestador.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleActivoPrestador.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx].activo = action.payload.activo;
        }
      })
      .addCase(toggleActivoPrestador.rejected, (state, action) => {
        state.error = action.payload || 'No se pudo cambiar el estado';
      });
  }
});

export const { limpiarError } = slice.actions;

// Selectores
export const selectPrestadores = (state) => state.prestadores.items;
export const selectPrestadoresLoading = (state) => state.prestadores.loading;
export const selectPrestadoresError = (state) => state.prestadores.error;

// Selector para obtener prestador por ID
export const selectPrestadorById = (id) => (state) => {
  return state.prestadores.items.find(p => p.id === id);
};

// Selector para obtener prestadores activos
export const selectPrestadoresActivos = (state) => {
  return state.prestadores.items.filter(p => p.activo);
};

// Selector para filtrar prestadores
export const selectPrestadoresFiltrados = (searchTerm) => (state) => {
  const prestadores = selectPrestadores(state);
  let resultado = prestadores;
  
  if (!searchTerm || searchTerm.trim() === '') {
    return resultado;
  }
  
  const searchLower = searchTerm.toLowerCase();
  
  // Detectar si el término de búsqueda incluye un día de la semana
  const diasSemana = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
  const diaEncontrado = diasSemana.find(dia => searchLower.includes(dia));
  
  resultado = resultado.filter(prestador => {
    // Búsqueda general
    const matchGeneral = 
      prestador.nombreCompleto.toLowerCase().includes(searchLower) ||
      prestador.cuilCuit.toLowerCase().includes(searchLower) ||
      prestador.tipo.toLowerCase().includes(searchLower) ||
      // Resolver nombre de centro por ID para búsqueda
      (() => {
        if (!prestador.integraCentroMedicoId) return false;
        const centro = selectPrestadores(state).find(p => p.id === prestador.integraCentroMedicoId);
        return centro ? centro.nombreCompleto.toLowerCase().includes(searchLower) : false;
      })() ||
      prestador.especialidades.some(esp => esp.nombre.toLowerCase().includes(searchLower)) ||
      prestador.lugaresAtencion.some(lugar => 
        lugar.direccion.toLowerCase().includes(searchLower)
      );
    
    // Si se detectó un día, también filtrar por día de atención
    if (diaEncontrado) {
      // Normalizar el día (capitalizar primera letra)
      const diaNormalizado = diaEncontrado.charAt(0).toUpperCase() + diaEncontrado.slice(1);
      const diaNormalizadoConTilde = diaNormalizado === 'Miercoles' ? 'Miércoles' : 
                                     diaNormalizado === 'Sabado' ? 'Sábado' : diaNormalizado;
      
      const matchDia = prestador.lugaresAtencion.some(lugar =>
        lugar.horarios && lugar.horarios.some(horario =>
          horario.dias && horario.dias.some(d => 
            d.toLowerCase() === diaEncontrado || 
            d === diaNormalizadoConTilde
          )
        )
      );
      
      return matchGeneral || matchDia;
    }
    
    return matchGeneral;
  });
  
  return resultado;
};

export default slice.reducer;

