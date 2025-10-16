// src/store/personasSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { personasService } from "../services/personasService";

// Async thunks
export const fetchPersona = createAsyncThunk(
  "personas/fetchPersona",
  async (personaId, { rejectWithValue }) => {
    try {
      return await personasService.getPersona(personaId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPersona = createAsyncThunk(
  "personas/createPersona",
  async (personaData, { rejectWithValue }) => {
    try {
      return await personasService.createPersona(personaData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePersona = createAsyncThunk(
  "personas/updatePersona",
  async ({ id, personaData }, { rejectWithValue }) => {
    try {
      return await personasService.updatePersona(id, personaData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePersona = createAsyncThunk(
  "personas/deletePersona",
  async (personaId, { rejectWithValue }) => {
    try {
      await personasService.deletePersona(personaId);
      return personaId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const personasSlice = createSlice({
  name: "personas",
  initialState: {
    currentPersona: null,
    loading: false,
    error: null,
    operationSuccess: false,
  },
  reducers: {
    clearCurrentPersona: (state) => {
      state.currentPersona = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOperationSuccess: (state) => {
      state.operationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Persona
      .addCase(fetchPersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersona.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPersona = action.payload;
        state.error = null;
      })
      .addCase(fetchPersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentPersona = null;
      })
      // Create Persona
      .addCase(createPersona.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(createPersona.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPersona = action.payload;
        state.operationSuccess = true;
        state.error = null;
      })
      .addCase(createPersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.operationSuccess = false;
      })
      // Update Persona
      .addCase(updatePersona.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(updatePersona.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPersona = action.payload;
        state.operationSuccess = true;
        state.error = null;
      })
      .addCase(updatePersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.operationSuccess = false;
      })
      // Delete Persona
      .addCase(deletePersona.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationSuccess = false;
      })
      .addCase(deletePersona.fulfilled, (state) => {
        state.loading = false;
        state.currentPersona = null;
        state.operationSuccess = true;
        state.error = null;
      })
      .addCase(deletePersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.operationSuccess = false;
      });
  },
});

export const { clearCurrentPersona, clearError, clearOperationSuccess } =
  personasSlice.actions;

export const selectCurrentPersona = (state) => state.personas.currentPersona;
export const selectPersonasLoading = (state) => state.personas.loading;
export const selectPersonasError = (state) => state.personas.error;
export const selectPersonasOperationSuccess = (state) =>
  state.personas.operationSuccess;

export default personasSlice.reducer;
