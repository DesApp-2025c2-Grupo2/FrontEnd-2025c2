import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  afiliados: [
    {
      id: "1",
      numeroAfiliado: 1,
      titularId: "1",
      planMedicoId: 1,
      alta: "2024-01-15",
      baja: null,
      situacionesTerapeuticas: [],
    },
    {
      id: "2",
      numeroAfiliado: 2,
      titularId: "4",
      planMedicoId: 4,
      alta: "2024-02-01",
      baja: null,
      situacionesTerapeuticas: [],
    },
    {
      id: "3",
      numeroAfiliado: 3,
      titularId: "6",
      planMedicoId: 3,
      alta: "2024-01-25",
      baja: "2024-12-31",
      situacionesTerapeuticas: [],
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
      state.afiliados.unshift(action.payload);
    },
    updateAfiliado: (state, action) => {
      const idx = state.afiliados.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1)
        state.afiliados[idx] = { ...state.afiliados[idx], ...action.payload };
    },
    setBajaAfiliado: (state, action) => {
      const { afiliadoId, fechaBaja } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) afiliado.baja = fechaBaja;
    },
    cancelBajaAfiliado: (state, action) => {
      const afiliado = state.afiliados.find((a) => a.id === action.payload);
      if (afiliado) afiliado.baja = null;
    },
    updatePlanMedicoAfiliado: (state, action) => {
      const { afiliadoId, planMedicoId } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) afiliado.planMedicoId = planMedicoId;
    },
    programarAltaAfiliado: (state, action) => {
      const { afiliadoId, fechaAlta } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.baja = null;
        afiliado.alta = fechaAlta;
      }
    },
    cancelarAltaProgramada: (state, action) => {
      const { afiliadoId, fechaAltaInmediata } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado && fechaAltaInmediata) afiliado.alta = fechaAltaInmediata;
    },
    reactivarAfiliado: (state, action) => {
      const { afiliadoId } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        const hoyISO = new Date().toISOString().split("T")[0];
        afiliado.baja = null;
        afiliado.alta = hoyISO;
      }
    },
    updateAltaAfiliado: (state, action) => {
      const { afiliadoId, fechaAlta } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) afiliado.alta = fechaAlta;
    },

    // ---- NUEVAS ACCIONES para situaciones sobre afiliado ----
    addSituacionAfiliado: (state, action) => {
      const { afiliadoId, situacionNombre } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        const exists = afiliado.situacionesTerapeuticas?.some(
          (s) => s?.toLowerCase?.() === String(situacionNombre).toLowerCase()
        );
        if (!exists) {
          afiliado.situacionesTerapeuticas = [
            ...(afiliado.situacionesTerapeuticas || []),
            situacionNombre,
          ];
        }
      }
    },
    removeSituacionAfiliado: (state, action) => {
      const { afiliadoId, index } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.situacionesTerapeuticas = (
          afiliado.situacionesTerapeuticas || []
        ).filter((_, i) => i !== index);
      }
    },
    setSituacionesAfiliado: (state, action) => {
      const { afiliadoId, situaciones } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) afiliado.situacionesTerapeuticas = situaciones || [];
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
  addSituacionAfiliado,
  removeSituacionAfiliado,
  setSituacionesAfiliado,
} = afiliadosSlice.actions;

export const selectAfiliados = (state) => state.afiliados.afiliados;
export const selectPlanesMedicos = (state) => state.afiliados.planesMedicos;

export default afiliadosSlice.reducer;
