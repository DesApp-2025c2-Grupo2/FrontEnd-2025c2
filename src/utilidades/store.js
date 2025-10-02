import { configureStore } from '@reduxjs/toolkit';
import especialidadesReducer from '../store/especialidadesSlice';
import situacionesReducer from '../store/situacionesTerapeuticasSlice';
import planesReducer from '../store/planesSlice';
import agendasReducer from '../store/agendasSlice';
import prestadoresReducer from '../store/prestadoresSlice';
import { loadState, saveState } from './localStorage';

// Cargar estado inicial desde localStorage
const persistedState = loadState();

export const store = configureStore({
  reducer: {
    especialidades: especialidadesReducer,
    situaciones: situacionesReducer,
    planes: planesReducer,
    agendas: agendasReducer,
    prestadores: prestadoresReducer,
  },
  preloadedState: persistedState,
});

// Suscribirse a cambios y guardar en localStorage
store.subscribe(() => {
  saveState(store.getState());
});

