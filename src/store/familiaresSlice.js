import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  familiares: [
    {
      id: "f1",
      numeroAfiliado: "0000001",
      numeroIntegrante: "02",
      tipoDocumento: "DNI",
      numeroDocumento: "87654321",
      nombre: "María",
      apellido: "Gómez",
      fechaNacimiento: "1985-08-20",
      telefonos: ["11-8765-4321", "15-2222-3333"],
      emails: ["maria.gomez@email.com", "maria.personal@hotmail.com"],
      direcciones: [
        "Av. Corrientes 1234, CABA",
        "San Martín 890, Vicente López",
      ],
      parentesco: "Cónyuge",
      situacionesTerapeuticas: ["Embarazo"],
      planMedico: "Plan Bronce",
      fechaAlta: "2024-01-15",
      activo: true,
    },
    {
      id: "f2",
      numeroAfiliado: "0000001",
      numeroIntegrante: "03",
      tipoDocumento: "DNI",
      numeroDocumento: "45678912",
      nombre: "Lucas",
      apellido: "Gómez",
      fechaNacimiento: "2010-03-12",
      telefonos: ["11-1234-5678"],
      emails: [],
      direcciones: ["Av. Corrientes 1234, CABA"],
      parentesco: "Hijo",
      situacionesTerapeuticas: [],
      planMedico: "Plan Bronce",
      fechaAlta: "2024-01-15",
      activo: true,
    },
    {
      id: "f3",
      numeroAfiliado: "0000002",
      numeroIntegrante: "02",
      tipoDocumento: "DNI",
      numeroDocumento: "99887766",
      nombre: "Carlos",
      apellido: "López",
      fechaNacimiento: "2015-06-25",
      telefonos: ["11-2233-4455"],
      emails: [],
      direcciones: ["Belgrano 567, CABA"],
      parentesco: "Hijo",
      situacionesTerapeuticas: [],
      planMedico: "Plan Platino",
      fechaAlta: "2024-02-01",
      activo: true,
    },
  ],
};

const familiaresSlice = createSlice({
  name: "familiares",
  initialState,
  reducers: {
    addFamiliar: (state, action) => {
      state.familiares.push(action.payload);
    },
    updateFamiliar: (state, action) => {
      const index = state.familiares.findIndex(
        (f) => f.id === action.payload.id
      );
      if (index !== -1) {
        state.familiares[index] = action.payload;
      }
    },
    deleteFamiliar: (state, action) => {
      state.familiares = state.familiares.filter(
        (f) => f.id !== action.payload
      );
    },
    toggleFamiliarActive: (state, action) => {
      const familiar = state.familiares.find((f) => f.id === action.payload);
      if (familiar) {
        familiar.activo = !familiar.activo;
      }
    },
    addTelefonoToFamiliar: (state, action) => {
      const { familiarId, telefono } = action.payload;
      const familiar = state.familiares.find((f) => f.id === familiarId);
      if (familiar && !familiar.telefonos.includes(telefono)) {
        familiar.telefonos.push(telefono);
      }
    },
    removeTelefonoFromFamiliar: (state, action) => {
      const { familiarId, telefonoIndex } = action.payload;
      const familiar = state.familiares.find((f) => f.id === familiarId);
      if (familiar) {
        familiar.telefonos = familiar.telefonos.filter(
          (_, index) => index !== telefonoIndex
        );
      }
    },
    addEmailToFamiliar: (state, action) => {
      const { familiarId, email } = action.payload;
      const familiar = state.familiares.find((f) => f.id === familiarId);
      if (familiar && !familiar.emails.includes(email)) {
        familiar.emails.push(email);
      }
    },
    removeEmailFromFamiliar: (state, action) => {
      const { familiarId, emailIndex } = action.payload;
      const familiar = state.familiares.find((f) => f.id === familiarId);
      if (familiar) {
        familiar.emails = familiar.emails.filter(
          (_, index) => index !== emailIndex
        );
      }
    },
    addDireccionToFamiliar: (state, action) => {
      const { familiarId, direccion } = action.payload;
      const familiar = state.familiares.find((f) => f.id === familiarId);
      if (familiar && !familiar.direcciones.includes(direccion)) {
        familiar.direcciones.push(direccion);
      }
    },
    removeDireccionFromFamiliar: (state, action) => {
      const { familiarId, direccionIndex } = action.payload;
      const familiar = state.familiares.find((f) => f.id === familiarId);
      if (familiar) {
        familiar.direcciones = familiar.direcciones.filter(
          (_, index) => index !== direccionIndex
        );
      }
    },
  },
});

export const {
  addFamiliar,
  updateFamiliar,
  deleteFamiliar,
  toggleFamiliarActive,
  addTelefonoToFamiliar,
  removeTelefonoFromFamiliar,
  addEmailToFamiliar,
  removeEmailFromFamiliar,
  addDireccionToFamiliar,
  removeDireccionFromFamiliar,
} = familiaresSlice.actions;

export default familiaresSlice.reducer;
