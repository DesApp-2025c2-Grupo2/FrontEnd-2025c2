import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit';
import * as planesService from '../services/planesService';

const initialState = {
  items: [
    {
      id: '1',
      codigo: 210,
      nombre: 'Plan 210',
      descripcion: 'Plan básico con cobertura esencial',
      precio: 18000,
      activo: true,
    },
    {
      id: '2',
      codigo: 310,
      nombre: 'Plan 310',
      descripcion: 'Plan intermedio con mayor cobertura',
      precio: 28000,
      activo: true,
    },
    {
      id: '3',
      codigo: 410,
      nombre: 'Plan 410',
      descripcion: 'Plan avanzado con cobertura amplia',
      precio: 38000,
      activo: true,
    },
    {
      id: '4',
      codigo: 510,
      nombre: 'Plan 510',
      descripcion: 'Plan superior con máxima cobertura',
      precio: 48000,
      activo: true,
    },
    {
      id: '5',
      codigo: 'BRONCE',
      nombre: 'Plan Bronce',
      descripcion: 'Cobertura básica con consultas y estudios esenciales',
      precio: 15000,
      activo: true,
    },
  ],
  filtro: '',
  loading: false,
  error: null,
};

export const cargarPlanes = createAsyncThunk('planes/cargar', async () => {
  // Semilla inicial si localStorage está vacío
  const data = await planesService.ensureSeed(initialState.items);
  // Normalizar/migrar: asegurar id único y tipos correctos
  const fixed = data.map((p) => ({
    id: p.id || nanoid(),
    codigo: p.codigo,
    nombre: p.nombre,
    descripcion: p.descripcion || '',
    precio: Number(p.precio) || 0,
    activo: p.activo ?? true,
  }));
  // Si hubo cambios, persistir migración
  const changed = JSON.stringify(data) !== JSON.stringify(fixed);
  if (changed) {
    await planesService.overwriteAll(fixed);
  }
  return fixed;
});

export const crearPlan = createAsyncThunk('planes/crear', async (plan) => {
  const payload = {
    id: plan.id || nanoid(),
    codigo: plan.codigo,
    nombre: plan.nombre,
    descripcion: plan.descripcion || '',
    precio: Number(plan.precio) || 0,
    activo: plan.activo ?? true,
  };
  const created = await planesService.createPlan(payload);
  return created;
});

export const editarPlan = createAsyncThunk('planes/editar', async (plan) => {
  const updated = await planesService.updatePlan(plan);
  return updated;
});

export const eliminarPlanThunk = createAsyncThunk('planes/eliminar', async (id) => {
  await planesService.deletePlan(id);
  return id;
});

export const alternarPlanThunk = createAsyncThunk('planes/alternar', async (id) => {
  const updated = await planesService.togglePlan(id);
  return updated;
});

const planesSlice = createSlice({
  name: 'planes',
  initialState,
  reducers: {
    setFiltro(state, action) {
      state.filtro = action.payload || '';
    },
    agregarPlan: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(plan) {
        return {
          payload: {
            id: plan.id || nanoid(),
            codigo: plan.codigo,
            nombre: plan.nombre,
            descripcion: plan.descripcion || '',
            precio: Number(plan.precio) || 0,
            activo: plan.activo ?? true,
          },
        };
      },
    },
    actualizarPlan(state, action) {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    eliminarPlan(state, action) {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    toggleActivo(state, action) {
      const plan = state.items.find(p => p.id === action.payload);
      if (plan) plan.activo = !plan.activo;
    },
  },
  extraReducers: (builder) => {
    builder
      // cargar
      .addCase(cargarPlanes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarPlanes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(cargarPlanes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Error al cargar planes';
      })
      // crear
      .addCase(crearPlan.pending, (state) => {
        state.error = null;
      })
      .addCase(crearPlan.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(crearPlan.rejected, (state, action) => {
        state.error = action.error?.message || 'No se pudo crear el plan';
      })
      // editar
      .addCase(editarPlan.pending, (state) => {
        state.error = null;
      })
      .addCase(editarPlan.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(editarPlan.rejected, (state, action) => {
        state.error = action.error?.message || 'No se pudo actualizar el plan';
      })
      // eliminar
      .addCase(eliminarPlanThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(eliminarPlanThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(eliminarPlanThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'No se pudo eliminar el plan';
      })
      // alternar activo
      .addCase(alternarPlanThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(alternarPlanThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(alternarPlanThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'No se pudo cambiar el estado del plan';
      });
  }
});

export const { setFiltro, agregarPlan, actualizarPlan, eliminarPlan, toggleActivo } = planesSlice.actions;

export const selectPlanes = state => state.planes.items;
export const selectFiltro = state => state.planes.filtro;
export const selectPlanesFiltrados = state => {
  const filtro = (state.planes.filtro || '').toLowerCase();
  if (!filtro) return state.planes.items;
  return state.planes.items.filter(p =>
    [p.nombre, String(p.codigo), p.descripcion]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(filtro))
  );
};

export default planesSlice.reducer;


