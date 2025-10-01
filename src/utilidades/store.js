import { configureStore } from '@reduxjs/toolkit';
import especialidadesReducer from '../store/especialidadesSlice';
import situacionesReducer from '../store/situacionesTerapeuticasSlice';
import planesReducer from '../store/planesSlice';
import afiliadosReducer from '../store/afiliadosSlice';
import familiaresReducer from '../store/familiaresSlice';

export const store = configureStore({
  reducer: {
    especialidades: especialidadesReducer,
    situaciones: situacionesReducer,
    planes: planesReducer,
    afiliados: afiliadosReducer,
    familiares: familiaresReducer,
  },
});

