import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  afiliados: [
    {
      id: "1",
      numeroAfiliado: "0000001",
      numeroIntegrante: "01",
      tipoDocumento: "DNI",
      numeroDocumento: "12345678",
      nombre: "Pedro",
      apellido: "Gómez",
      fechaNacimiento: "1980-05-15",
      telefonos: ["11-1234-5678", "11-9876-5432", "15-5555-1234"],
      emails: [
        "pedro.gomez@email.com",
        "pedro.trabajo@empresa.com",
        "pgomez@gmail.com",
      ],
      direcciones: [
        "Av. Corrientes 1234, CABA",
        "San Martín 890, Vicente López",
        "Rivadavia 456, Quilmes",
      ],
      parentesco: "Titular",
      situacionesTerapeuticas: [],
      planMedico: "Plan Bronce",
      fechaAlta: "2024-01-15",
      activo: true,
      familiaresIds: ["f1", "f2"],
    },
    {
      id: "2",
      numeroAfiliado: "0000002",
      numeroIntegrante: "01",
      tipoDocumento: "DNI",
      numeroDocumento: "11223344",
      nombre: "Ana",
      apellido: "López",
      fechaNacimiento: "1975-12-10",
      telefonos: ["11-2233-4455", "11-7777-8888"],
      emails: ["ana.lopez@email.com", "ana.trabajo@consultora.com"],
      direcciones: ["Belgrano 567, CABA", "Libertador 1200, San Isidro"],
      parentesco: "Titular",
      situacionesTerapeuticas: ["Diabetes"],
      planMedico: "Plan Platino",
      fechaAlta: "2024-02-01",
      activo: true,
      familiaresIds: ["f3"],
    },
    {
      id: "3",
      numeroAfiliado: "0000003",
      numeroIntegrante: "01",
      tipoDocumento: "DNI",
      numeroDocumento: "55667788",
      nombre: "Roberto",
      apellido: "Fernández",
      fechaNacimiento: "1982-09-18",
      telefonos: ["11-5566-7788"],
      emails: ["roberto.fernandez@email.com"],
      direcciones: ["Mitre 789, Avellaneda"],
      parentesco: "Titular",
      situacionesTerapeuticas: [],
      planMedico: "Plan Oro",
      fechaAlta: "2024-01-25",
      activo: true,
      familiaresIds: [],
    },
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
    deleteAfiliado: (state, action) => {
      state.afiliados = state.afiliados.filter((a) => a.id !== action.payload);
    },
    toggleAfiliadoActive: (state, action) => {
      const afiliado = state.afiliados.find((a) => a.id === action.payload);
      if (afiliado) {
        afiliado.activo = !afiliado.activo;
      }
    },
    addFamiliarToAfiliado: (state, action) => {
      const { afiliadoId, familiarId } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado && !afiliado.familiaresIds.includes(familiarId)) {
        afiliado.familiaresIds.push(familiarId);
      }
    },
    removeFamiliarFromAfiliado: (state, action) => {
      const { afiliadoId, familiarId } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.familiaresIds = afiliado.familiaresIds.filter(
          (id) => id !== familiarId
        );
      }
    },
    addTelefonoToAfiliado: (state, action) => {
      const { afiliadoId, telefono } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado && !afiliado.telefonos.includes(telefono)) {
        afiliado.telefonos.push(telefono);
      }
    },
    removeTelefonoFromAfiliado: (state, action) => {
      const { afiliadoId, telefonoIndex } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.telefonos = afiliado.telefonos.filter(
          (_, index) => index !== telefonoIndex
        );
      }
    },
    addEmailToAfiliado: (state, action) => {
      const { afiliadoId, email } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado && !afiliado.emails.includes(email)) {
        afiliado.emails.push(email);
      }
    },
    removeEmailFromAfiliado: (state, action) => {
      const { afiliadoId, emailIndex } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.emails = afiliado.emails.filter(
          (_, index) => index !== emailIndex
        );
      }
    },
    addDireccionToAfiliado: (state, action) => {
      const { afiliadoId, direccion } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado && !afiliado.direcciones.includes(direccion)) {
        afiliado.direcciones.push(direccion);
      }
    },
    removeDireccionFromAfiliado: (state, action) => {
      const { afiliadoId, direccionIndex } = action.payload;
      const afiliado = state.afiliados.find((a) => a.id === afiliadoId);
      if (afiliado) {
        afiliado.direcciones = afiliado.direcciones.filter(
          (_, index) => index !== direccionIndex
        );
      }
    },
  },
});

export const {
  addAfiliado,
  updateAfiliado,
  deleteAfiliado,
  toggleAfiliadoActive,
  addFamiliarToAfiliado,
  removeFamiliarFromAfiliado,
  addTelefonoToAfiliado,
  removeTelefonoFromAfiliado,
  addEmailToAfiliado,
  removeEmailFromAfiliado,
  addDireccionToAfiliado,
  removeDireccionFromAfiliado,
} = afiliadosSlice.actions;

export default afiliadosSlice.reducer;
