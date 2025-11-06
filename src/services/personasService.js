import WebAPI from "./config/WebAPI";
const ENDPOINT = "/Personas";

// --- Helper: convierte recursivamente todas las claves a PascalCase ---
function toPascalCaseKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toPascalCaseKeys);
  } else if (obj && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      acc[pascalKey] = toPascalCaseKeys(value);
      return acc;
    }, {});
  }
  return obj;
}

export const personasService = {
  // Obtener una persona por ID
  getPersona: async (id) => {
    const response = await WebAPI.Instance().get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Crear una nueva persona
  createPersona: async (personaData) => {
    const payloadPascal = toPascalCaseKeys(personaData);
    console.log("personasService.create payload (PascalCase):", payloadPascal);
    const response = await WebAPI.Instance().post(
      `${ENDPOINT}/addMember/0`,
      payloadPascal
    ); // afiliadoID se pasa como 0 o el adecuado
    return response.data;
  },

  // Actualizar una persona existente
  updatePersona: async (personaData) => {
    const payloadPascal = toPascalCaseKeys(personaData);
    console.log("personasService.update payload (PascalCase):", payloadPascal);
    const response = await WebAPI.Instance().put(
      `${ENDPOINT}/update`,
      payloadPascal
    );
    return response.data;
  },

  // Buscar personas por criterios
  searchPersonas: async (filters = {}) => {
    const response = await WebAPI.Instance().get(`${ENDPOINT}`, {
      params: filters,
    });
    return response.data;
  },

  addMember: async (afiliadoID, memberData) => {
    const payloadPascal = toPascalCaseKeys(memberData);
    console.log(
      "personasService.addMember payload (PascalCase):",
      payloadPascal
    );
    const response = await WebAPI.Instance().post(
      `${ENDPOINT}/addMember/${afiliadoID}`,
      payloadPascal
    );
    return response.data;
  },
};
