import WebAPI from "./config/WebAPI";
const ENDPOINT = "/Personas";

export const personasService = {
  // Obtener una persona por ID
  getPersona: async (id) => {
    const response = await WebAPI.Instance().get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Crear una nueva persona
  createPersona: async (personaData) => {
    const response = await WebAPI.Instance().post(`${ENDPOINT}`, personaData);
    return response.data;
  },

  // Actualizar una persona existente
  updatePersona: async (id, personaData) => {
    const response = await WebAPI.Instance().put(`${ENDPOINT}/${id}`, personaData);
    return response.data;
  },

  // Buscar personas por criterios
  searchPersonas: async (filters = {}) => {
    const response = await WebAPI.Instance().get(`${ENDPOINT}`, { params: filters });
    return response.data;
  },
};
