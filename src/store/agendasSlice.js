import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toggleActivoPrestador } from './prestadoresSlice';

// Datos iniciales (seed data)
const seedAgendas = [
  {
    id: 1,
    prestadorId: 1,
    prestador: 'Dra. Tita Merello',
    especialidad: 'Cardiología',
    totalTurnos: 6,
    activo: true,
    direcciones: [
      {
        lugar: 'Avenida Vergara 1908, CABA',
        duracion: 30,
        turnosPorSemana: 6,
        horarios: [
          {
            dia: 'Lunes',
            horario: '09:00-12:00'
          }
        ],
        fechaCreacion: '14/1/2024'
      }
    ]
  },
  {
    id: 2,
    prestadorId: 2,
    prestador: 'Dr. Carlos Mendez',
    especialidad: 'Traumatología',
    totalTurnos: 10,
    activo: true,
    direcciones: [
      {
        lugar: 'Rivadavia 2345, CABA',
        duracion: 45,
        turnosPorSemana: 10,
        horarios: [
          {
            dia: 'Martes',
            horario: '14:00-18:00'
          },
          {
            dia: 'Jueves',
            horario: '08:00-12:00'
          }
        ],
        fechaCreacion: '19/1/2024'
      }
    ]
  },
  {
    id: 3,
    prestadorId: 3,
    prestador: 'Dr. Roberto Silva',
    especialidad: 'Clínico',
    totalTurnos: 72,
    activo: true,
    direcciones: [
      {
        lugar: 'Corrientes 1234, CABA',
        duracion: 30,
        turnosPorSemana: 24,
        horarios: [
          {
            dia: 'Lunes',
            horario: '08:00-12:00'
          },
          {
            dia: 'Miércoles',
            horario: '14:00-18:00'
          },
          {
            dia: 'Viernes',
            horario: '08:00-12:00'
          }
        ],
        fechaCreacion: '29/2/2024'
      },
      {
        lugar: 'Santa Fe 5678, CABA',
        duracion: 30,
        turnosPorSemana: 24,
        horarios: [
          {
            dia: 'Lunes',
            horario: '14:00-18:00'
          },
          {
            dia: 'Martes',
            horario: '08:00-12:00'
          },
          {
            dia: 'Jueves',
            horario: '14:00-18:00'
          }
        ],
        fechaCreacion: '29/2/2024'
      },
      {
        lugar: 'Callao 9012, CABA',
        duracion: 30,
        turnosPorSemana: 24,
        horarios: [
          {
            dia: 'Martes',
            horario: '14:00-18:00'
          },
          {
            dia: 'Miércoles',
            horario: '08:00-12:00'
          },
          {
            dia: 'Viernes',
            horario: '14:00-18:00'
          }
        ],
        fechaCreacion: '29/2/2024'
      }
    ]
  },
  {
    id: 4,
    prestadorId: 1,
    prestador: 'Dra. Tita Merello',
    especialidad: ['Cardiología', 'Clínico'],
    totalTurnos: 12,
    activo: true,
    direcciones: [
      {
        lugar: 'Avenida Vergara 1908, CABA',
        duracion: 30,
        turnosPorSemana: 12,
        horarios: [
          {
            dia: 'Miércoles',
            horario: '14:00-18:00'
          }
        ],
        fechaCreacion: '20/1/2024'
      }
    ]
  }
];

const initialState = {
  items: seedAgendas,
  loading: false,
  error: null,
};

// Thunks asíncronos
export const cargarAgendas = createAsyncThunk(
  'agendas/cargar',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Simular llamada a API
      await new Promise(r => setTimeout(r, 500));
      
      // Si ya hay datos en el estado (cargados desde localStorage), usarlos
      const state = getState();
      if (state.agendas.items && state.agendas.items.length > 0) {
        return state.agendas.items;
      }
      
      // Si no hay datos, cargar los datos semilla
      // TODO: Reemplazar con llamada real a API
      // const response = await agendasService.getAll();
      // return response.data;
      return seedAgendas;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar agendas');
    }
  }
);

export const crearAgenda = createAsyncThunk(
  'agendas/crear',
  async (agenda, { rejectWithValue, getState }) => {
    try {
      // Simular llamada a API
      await new Promise(r => setTimeout(r, 400));
      
      // Generar ID
      const state = getState();
      const maxId = Math.max(...state.agendas.items.map(a => a.id), 0);
      const nuevaAgenda = {
        ...agenda,
        id: maxId + 1,
        activo: true
      };
      
      // TODO: Reemplazar con llamada real a API
      // const response = await agendasService.create(agenda);
      // return response.data;
      
      return nuevaAgenda;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al crear agenda');
    }
  }
);

export const editarAgenda = createAsyncThunk(
  'agendas/editar',
  async (agenda, { rejectWithValue }) => {
    try {
      // Simular llamada a API
      await new Promise(r => setTimeout(r, 400));
      
      // TODO: Reemplazar con llamada real a API
      // const response = await agendasService.update(agenda.id, agenda);
      // return response.data;
      
      return agenda;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al editar agenda');
    }
  }
);

export const eliminarAgenda = createAsyncThunk(
  'agendas/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      // Simular llamada a API
      await new Promise(r => setTimeout(r, 400));
      
      // TODO: Reemplazar con llamada real a API
      // await agendasService.delete(id);
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al eliminar agenda');
    }
  }
);

export const toggleActivoAgenda = createAsyncThunk(
  'agendas/toggleActivo',
  async (id, { rejectWithValue }) => {
    try {
      // Simular llamada a API
      await new Promise(r => setTimeout(r, 400));
      
      // TODO: Reemplazar con llamada real a API
      // const response = await agendasService.toggleActivo(id);
      // return response.data;
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cambiar estado de la agenda');
    }
  }
);

const slice = createSlice({
  name: 'agendas',
  initialState,
  reducers: {
    // Reducer para limpiar errores
    limpiarError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Cargar agendas
      .addCase(cargarAgendas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarAgendas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(cargarAgendas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar agendas';
      })
      
      // Crear agenda
      .addCase(crearAgenda.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearAgenda.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(crearAgenda.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'No se pudo crear la agenda';
      })
      
      // Editar agenda
      .addCase(editarAgenda.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editarAgenda.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(editarAgenda.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'No se pudo actualizar la agenda';
      })
      
      // Eliminar agenda
      .addCase(eliminarAgenda.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(eliminarAgenda.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(a => a.id !== action.payload);
      })
      .addCase(eliminarAgenda.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'No se pudo eliminar la agenda';
      })

      // Toggle activo agenda
      .addCase(toggleActivoAgenda.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleActivoAgenda.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(a => a.id === action.payload);
        if (idx !== -1) {
          state.items[idx].activo = !state.items[idx].activo;
        }
      })
      .addCase(toggleActivoAgenda.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'No se pudo cambiar el estado de la agenda';
      })

      // Escuchar cuando un prestador se desactiva y desactivar sus agendas
      .addCase(toggleActivoPrestador.fulfilled, (state, action) => {
        const { prestadorId, activo } = action.payload;
        
        // Si el prestador se desactiva, desactivar todas sus agendas
        if (!activo) {
          state.items.forEach((agenda) => {
            if (agenda.prestadorId === prestadorId) {
              agenda.activo = false;
            }
          });
        }
      });
  }
});

export const { limpiarError } = slice.actions;

// Selectores
export const selectAgendas = (state) => state.agendas.items;
export const selectAgendasLoading = (state) => state.agendas.loading;
export const selectAgendasError = (state) => state.agendas.error;

// Selector para filtrar agendas por término de búsqueda
export const selectAgendasFiltradas = (searchTerm) => (state) => {
  const agendas = selectAgendas(state);
  if (!searchTerm || searchTerm.trim() === '') {
    return agendas;
  }
  
  const searchLower = searchTerm.toLowerCase();
  return agendas.filter(agenda => {
    // Manejar especialidad como string o array
    const especialidadMatch = Array.isArray(agenda.especialidad)
      ? agenda.especialidad.some(esp => esp.toLowerCase().includes(searchLower))
      : agenda.especialidad.toLowerCase().includes(searchLower);
    
    return (
      agenda.prestador.toLowerCase().includes(searchLower) ||
      especialidadMatch ||
      agenda.direcciones.some(dir => dir.lugar.toLowerCase().includes(searchLower))
    );
  });
};

export default slice.reducer;

