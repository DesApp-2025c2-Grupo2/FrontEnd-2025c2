import { configureStore } from '@reduxjs/toolkit';
import especialidadesReducer from '../store/especialidadesSlice';

export const store = configureStore({
  reducer: {
    especialidades: especialidadesReducer,
  },
});

