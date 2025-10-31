import { configureStore } from "@reduxjs/toolkit";
import especialidadesReducer from "../store/especialidadesSlice";
import situacionesReducer from "../store/situacionesTerapeuticasSlice";
import planesReducer from "../store/planesSlice";
import afiliadosReducer from "../store/afiliadosSlice";
import prestadoresReducer from '../store/prestadoresSlice';
import reportesReducer from '../store/reportesSlice';
import personasReducer from '../store/personasSlice';
import { loadState, saveState } from './localStorage';

// Cargar estado inicial desde localStorage (solo partes no-catálogo)
const persistedState = loadState() || undefined;

export const store = configureStore({
  reducer: {
    especialidades: especialidadesReducer,
    situaciones: situacionesReducer,
    planes: planesReducer,
    afiliados: afiliadosReducer,
    prestadores: prestadoresReducer,
    reportes: reportesReducer,
    personas: personasReducer
  },
  preloadedState: persistedState,
});

// Suscribirse a cambios y guardar en localStorage
store.subscribe(() => {
  const { planes, especialidades, situaciones, ...rest } = store.getState();
  saveState(rest);
});
