import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  afiliados: [
    {
      id: "1",
      numeroAfiliado: 1,
      titularId: "1", // ID de la persona que es el titular
      planMedicoId: 1,
      alta: "2024-01-15",
      baja: null,
    },
    {
      id: "2",
      numeroAfiliado: 2,
      titularId: "4", // ID de la persona que es el titular
      planMedicoId: 4,
      alta: "2024-02-01",
      baja: null,
    },
    {
      id: "3",
      numeroAfiliado: 3,
      titularId: "6", // ID de la persona que es el titular
      planMedicoId: 3,
      alta: "2024-01-25",
      baja: "2024-12-31",
    },
  ],
  planesMedicos: [
    { id: 1, nombre: "Plan Bronce" },
    { id: 2, nombre: "Plan Plata" },
    { id: 3, nombre: "Plan Oro" },
    { id: 4, nombre: "Plan Platino" },
  ],
};

const afiliadosSlice = createSlice({
  name: "afiliados",
  initialState,
  reducers: {
    addAfiliado: (state, action) => {
      state.afiliados.push(action.payload);
    },
    updateAfiliado: (state, action) => {
      const index = state.afiliados.findIndex(
        (a) => a.id === action.payload.id
      );
      if (index !== -1) {
        state.afiliados[index] = action.payload;
      }
    },
    setBajaAfiliado: (state, action) => {
      const { afiliadoId, fechaBaja } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.baja = fechaBaja;
      }
    },
    cancelBajaAfiliado: (state, action) => {
      const afiliado = state.afiliados.find((a) => a.id === action.payload);
      if (afiliado) {
        afiliado.baja = null;
      }
    },
    // Nueva acción para actualizar solo el plan médico
    updatePlanMedicoAfiliado: (state, action) => {
      const { afiliadoId, planMedicoId } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.planMedicoId = planMedicoId;
      }
    },
    programarAltaAfiliado: (state, action) => {
      const { afiliadoId, fechaAlta } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        // Si programamos una alta, cancelamos cualquier baja existente
        afiliado.baja = null;
        afiliado.alta = fechaAlta;
      }
    },
    cancelarAltaProgramada: (state, action) => {
      const { afiliadoId, fechaAltaInmediata } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        // Si cancelamos alta programada, ponemos alta inmediata o mantenemos la actual
        if (fechaAltaInmediata) {
          afiliado.alta = fechaAltaInmediata;
        }
        // Nota: No restauramos la baja aquí, eso se maneja por separado
      }
    },
    // Acción para reactivar inmediatamente (alta inmediata)
    reactivarAfiliado: (state, action) => {
      const { afiliadoId } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        const hoy = new Date().toLocaleDateString("es-AR", {
          timeZone: "UTC",
        });
        afiliado.baja = null;
        afiliado.alta = hoy;
      }
    },
    updateAltaAfiliado: (state, action) => {
      const { afiliadoId, fechaAlta } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.alta = fechaAlta;
      }
    },
  },
});

export const {
  addAfiliado,
  updateAfiliado,
  setBajaAfiliado,
  cancelBajaAfiliado,
  updatePlanMedicoAfiliado,
  programarAltaAfiliado,
  cancelarAltaProgramada,
  reactivarAfiliado,
  updateAltaAfiliado,
} = afiliadosSlice.actions;

export default afiliadosSlice.reducer;
