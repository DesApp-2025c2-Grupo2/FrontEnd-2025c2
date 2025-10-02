import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  personas: [
    {
      id: "1",
      numeroIntegrante: 1,
      nombre: "Pedro",
      apellido: "Gómez",
      tipoDocumento: "DNI",
      numeroDocumento: "12345678",
      fechaNacimiento: "1980-05-15",
      parentesco: 1, // 1: Titular
      afiliadoId: "1",
      alta: "2024-01-15",
      baja: null,
      telefonos: ["11-1234-5678", "11-9876-5432", "15-5555-1234"],
      emails: ["pedro.gomez@email.com", "pedro.trabajo@empresa.com"],
      direcciones: ["Av. Corrientes 1234, CABA", "San Martín 890, Vicente López"],
      situacionesTerapeuticas: [],
    },
    {
      id: "2",
      numeroIntegrante: 2,
      nombre: "María",
      apellido: "Gómez",
      tipoDocumento: "DNI",
      numeroDocumento: "23345678",
      fechaNacimiento: "1985-08-20",
      parentesco: 2,
      afiliadoId: "1",
      alta: "2024-01-15",
      baja: null,
      telefonos: ["11-8765-4321", "15-2222-3333"],
      emails: ["maria.gomez@email.com"],
      direcciones: ["Av. Corrientes 1234, CABA"],
      situacionesTerapeuticas: ["Embarazo"],
    },
    {
      id: "3",
      numeroIntegrante: 3,
      nombre: "Lucas",
      apellido: "Gómez",
      tipoDocumento: "DNI",
      numeroDocumento: "48654321",
      fechaNacimiento: "2010-03-12",
      parentesco: 3,
      afiliadoId: "1",
      alta: "2024-01-15",
      baja: null,
      telefonos: ["11-1234-5678"],
      emails: [],
      direcciones: ["Av. Corrientes 1234, CABA"],
      situacionesTerapeuticas: [],
    },
    {
      id: "4",
      numeroIntegrante: 1,
      nombre: "Ana",
      apellido: "López",
      tipoDocumento: "DNI",
      numeroDocumento: "35687457",
      fechaNacimiento: "1975-12-10",
      parentesco: 1,
      afiliadoId: "2",
      alta: "2024-02-01",
      baja: null,
      telefonos: ["11-2233-4455", "11-7777-8888"],
      emails: ["ana.lopez@email.com"],
      direcciones: ["Belgrano 567, CABA"],
      situacionesTerapeuticas: ["Diabetes"],
    },
    {
      id: "5",
      numeroIntegrante: 2,
      nombre: "Carlos",
      apellido: "López",
      tipoDocumento: "DNI",
      numeroDocumento: "26589451",
      fechaNacimiento: "2015-06-25",
      parentesco: 3,
      afiliadoId: "2",
      alta: "2024-02-01",
      baja: null,
      telefonos: ["11-2233-4455"],
      emails: [],
      direcciones: ["Belgrano 567, CABA"],
      situacionesTerapeuticas: [],
    },
    {
      id: "6",
      numeroIntegrante: 1,
      nombre: "Roberto",
      apellido: "Fernández",
      tipoDocumento: "DNI",
      numeroDocumento: "26987453",
      fechaNacimiento: "1982-09-18",
      parentesco: 1,
      afiliadoId: "3",
      alta: "2024-01-25",
      baja: null,
      telefonos: ["11-5566-7788"],
      emails: ["roberto.fernandez@email.com"],
      direcciones: ["Mitre 789, Avellaneda"],
      situacionesTerapeuticas: [],
    },
  ],
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
      if (persona && !persona.telefonos.includes(telefono)) persona.telefonos.push(telefono);
    },
    removeTelefonoFromPersona: (state, action) => {
      const { personaId, telefonoIndex } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona) persona.telefonos = persona.telefonos.filter((_, i) => i !== telefonoIndex);
    },
    addEmailToPersona: (state, action) => {
      const { personaId, email } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona && !persona.emails.includes(email)) persona.emails.push(email);
    },
    removeEmailFromPersona: (state, action) => {
      const { personaId, emailIndex } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona) persona.emails = persona.emails.filter((_, i) => i !== emailIndex);
    },
    addDireccionToPersona: (state, action) => {
      const { personaId, direccion } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona && !persona.direcciones.includes(direccion)) persona.direcciones.push(direccion);
    },
    removeDireccionFromPersona: (state, action) => {
      const { personaId, direccionIndex } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona) persona.direcciones = persona.direcciones.filter((_, i) => i !== direccionIndex);
    },
    addSituacionTerapeuticaToPersona: (state, action) => {
      const { personaId, situacion } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona && !persona.situacionesTerapeuticas.includes(situacion)) persona.situacionesTerapeuticas.push(situacion);
    },
    removeSituacionTerapeuticaFromPersona: (state, action) => {
      const { personaId, situacionIndex } = action.payload;
      const persona = state.personas.find((p) => p.id === personaId);
      if (persona) persona.situacionesTerapeuticas = persona.situacionesTerapeuticas.filter((_, i) => i !== situacionIndex);
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
});

export const {
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

export default personasSlice.reducer;
