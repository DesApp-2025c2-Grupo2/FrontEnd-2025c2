import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  darBajaPersona as darBajaPersonaService,
  reactivarPersona as reactivarPersonaService,
} from "../services/afiliadosService";

// Async Thunks
export const darBajaPersona = createAsyncThunk(
  "personas/darBajaPersona",
  async ({ personaId, fechaBaja }, { rejectWithValue }) => {
    try {
      const result = await darBajaPersonaService(personaId, fechaBaja);
      return { personaId, fechaBaja, result };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const reactivarPersona = createAsyncThunk(
  "personas/reactivarPersona",
  async (personaId, { rejectWithValue }) => {
    try {
      const result = await reactivarPersonaService(personaId);
      return { personaId, result };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  personas: [],
  loading: false,
  error: null,
  parentescos: [
    { id: 1, nombre: "Titular" },
    { id: 2, nombre: "Cónyuge" },
    { id: 3, nombre: "Hijo" },
    { id: 4, nombre: "FamiliarACargo" },
  ],
  tiposDocumento: [
    { id: "DNI", nombre: "DNI" },
    { id: "LC", nombre: "LC" },
    { id: "LE", nombre: "LE" },
    { id: "Pasaporte", nombre: "Pasaporte" },
  ],
};

const personasSlice = createSlice({
  name: "personas",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Las personas se cargan desde los afiliados, no necesitamos fetch separado
    setPersonasFromAfiliados: (state, action) => {
      const afiliados = action.payload;
      const todasPersonas = afiliados.flatMap(
        (afiliado) => afiliado.integrantes || []
      );
      state.personas = todasPersonas;
    },

    // Acciones sync para formularios (mantenemos las del slice original)
    addPersona: (state, action) => {
      state.personas.push(action.payload);
    },
    updatePersona: (state, action) => {
      const index = state.personas.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.personas[index] = { ...state.personas[index], ...action.payload };
      }
    },
    deletePersona: (state, action) => {
      state.personas = state.personas.filter((p) => p.id !== action.payload);
    },
    setBajaPersona: (state, action) => {
      const { personaId, fechaBaja } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona) persona.baja = fechaBaja;
    },
    cancelBajaPersona: (state, action) => {
      const persona = state.personas.find((p) => p.id === action.payload);
      if (persona) persona.baja = null;
    },
    addTelefonoToPersona: (state, action) => {
      const { personaId, telefono } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona && !persona.telefonos.includes(telefono))
        persona.telefonos.push(telefono);
    },
    removeTelefonoFromPersona: (state, action) => {
      const { personaId, telefonoIndex } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona)
        persona.telefonos = persona.telefonos.filter(
          (_, i) => i !== telefonoIndex
        );
    },
    addEmailToPersona: (state, action) => {
      const { personaId, email } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona && !persona.emails.includes(email))
        persona.emails.push(email);
    },
    removeEmailFromPersona: (state, action) => {
      const { personaId, emailIndex } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona)
        persona.emails = persona.emails.filter((_, i) => i !== emailIndex);
    },
    addDireccionToPersona: (state, action) => {
      const { personaId, direccion } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona && !persona.direcciones.includes(direccion))
        persona.direcciones.push(direccion);
    },
    removeDireccionFromPersona: (state, action) => {
      const { personaId, direccionIndex } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona)
        persona.direcciones = persona.direcciones.filter(
          (_, i) => i !== direccionIndex
        );
    },
    addSituacionTerapeuticaToPersona: (state, action) => {
      const { personaId, situacion } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona && !persona.situacionesTerapeuticas.includes(situacion))
        persona.situacionesTerapeuticas.push(situacion);
    },
    removeSituacionTerapeuticaFromPersona: (state, action) => {
      const { personaId, situacionIndex } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona)
        persona.situacionesTerapeuticas =
          persona.situacionesTerapeuticas.filter(
            (_, i) => i !== situacionIndex
          );
    },
    updateAfiliadoIdPersona: (state, action) => {
      const { personaId, afiliadoId } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona) persona.afiliadoId = afiliadoId;
    },
    updateAltaPersona: (state, action) => {
      const { personaId, fechaAlta } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona) persona.alta = fechaAlta;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dar Baja Persona
      .addCase(darBajaPersona.fulfilled, (state, action) => {
        const { personaId, fechaBaja } = action.payload;
        const persona = state.personas.find((p) => p.id === personaId);
        if (persona) persona.baja = fechaBaja;
      })
      // Reactivar Persona
      .addCase(reactivarPersona.fulfilled, (state, action) => {
        const { personaId } = action.payload;
        const persona = state.personas.find((p) => p.id === personaId);
        if (persona) persona.baja = null;
      });
  },
});

// Exportar todas las acciones
export const {
  clearError,
  setPersonasFromAfiliados,
  addPersona,
  updatePersona,
  deletePersona,
  setBajaPersona,
  cancelBajaPersona,
  addTelefonoToPersona,
  removeTelefonoFromPersona,
  addEmailToPersona,
  removeEmailFromPersona,
  addDireccionToPersona,
  removeDireccionFromPersona,
  addSituacionTerapeuticaToPersona,
  removeSituacionTerapeuticaFromPersona,
  updateAfiliadoIdPersona,
  updateAltaPersona,
} = personasSlice.actions;

export const selectPersonas = (state) => state.personas.personas;
export const selectParentescos = (state) => state.personas.parentescos;
export const selectTiposDocumento = (state) => state.personas.tiposDocumento;
export const selectPersonasLoading = (state) => state.personas.loading;
export const selectPersonasError = (state) => state.personas.error;

export default personasSlice.reducer;
