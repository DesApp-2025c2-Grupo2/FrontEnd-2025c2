import { createSlice } from "@reduxjs/toolkit"

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
      direcciones: ["Av. Corrientes 1234, CABA", "San Martín 890, Vicente López"],
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
}

const familiaresSlice = createSlice({
  name: "familiares",
  initialState,
  reducers: {
    addFamiliar: (state, action) => {
      state.familiares.push(action.payload)
    },
    updateFamiliar: (state, action) => {
      const index = state.familiares.findIndex((f) => f.id === action.payload.id)
      if (index !== -1) {
        state.familiares[index] = action.payload
      }
    },
    deleteFamiliar: (state, action) => {
      state.familiares = state.familiares.filter((f) => f.id !== action.payload)
    },
    toggleFamiliarActive: (state, action) => {
      const familiar = state.familiares.find((f) => f.id === action.payload)
      if (familiar) {
        familiar.activo = !familiar.activo
      }
    },
  },
})

export const {
  addFamiliar,
  updateFamiliar,
  deleteFamiliar,
  toggleFamiliarActive,
} = familiaresSlice.actions

export default familiaresSlice.reducer
