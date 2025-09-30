import { configureStore } from '@reduxjs/toolkit';
import especialidadesReducer from '../store/especialidadesSlice';
import situacionesReducer from '../store/situacionesTerapeuticasSlice';
import planesReducer from '../store/planesSlice';

export const store = configureStore({
  reducer: {
    especialidades: especialidadesReducer,
    situaciones: situacionesReducer,
    planes: planesReducer,
  },
});

