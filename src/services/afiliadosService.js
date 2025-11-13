import WebAPI from "./config/WebAPI";
const ENDPOINT = "/Afiliados";

// --- 🔧 Helper: convierte recursivamente todas las claves a PascalCase ---
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

export const AfiliadosService = {
  // Obtener todos los afiliados
  getAll: async () => {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/all`);
    const data = res.data;
    if (!Array.isArray(data)) return [];
    return data.map((a) => ({
      id: a.id,
      numeroAfiliado: a.numeroAfiliado ?? a.NumeroAfiliado ?? "",
      titularID: a.titularID ?? a.titularId ?? null,
      planMedicoId: a.planMedicoId ?? a.PlanMedicoId ?? null,
      alta: a.alta ?? a.Alta ?? null,
      baja: a.baja ?? a.Baja ?? null,
      integrantes: Array.isArray(a.integrantes)
        ? a.integrantes
        : a.Integrantes ?? [],
    }));
  },

  // Crear afiliado con conversión a PascalCase
  create: async (payload) => {
    const payloadPascal = toPascalCaseKeys(payload);
    console.log("AfiliadosService.create payload (PascalCase):", payloadPascal);
    const res = await WebAPI.Instance().post(
      `${ENDPOINT}/create`,
      payloadPascal
    );
    const a = res.data || {};
    return {
      id: a.id,
      numeroAfiliado: a.numeroAfiliado ?? a.NumeroAfiliado,
      titularID: a.titularID ?? a.titularId,
      planMedicoId: a.planMedicoId ?? a.PlanMedicoId,
      alta: a.alta ?? a.Alta ?? null,
      baja: a.baja ?? a.Baja ?? null,
      integrantes: Array.isArray(a.integrantes)
        ? a.integrantes
        : a.Integrantes ?? [],
    };
  },

  // Actualizar afiliado con conversión a PascalCase
  update: async (id, payload) => {
    const payloadPascal = toPascalCaseKeys(payload);
    console.log(
      "AfiliadosService.update id, payload (PascalCase):",
      id,
      payloadPascal
    );
    const res = await WebAPI.Instance().put(
      `${ENDPOINT}/update/${id}`,
      payloadPascal
    );
    const a = res.data || {};
    return {
      id: a.id,
      numeroAfiliado: a.numeroAfiliado ?? a.NumeroAfiliado,
      titularID: a.titularID ?? a.titularId,
      planMedicoId: a.planMedicoId ?? a.PlanMedicoId,
      alta: a.alta ?? a.Alta ?? null,
      baja: a.baja ?? a.Baja ?? null,
      integrantes: Array.isArray(a.integrantes)
        ? a.integrantes
        : a.Integrantes ?? [],
    };
  },

  // Eliminar afiliado
  delete: async (id) => {
    const res = await WebAPI.Instance().delete(`${ENDPOINT}/${id}`);
    return { id, data: res.data };
  },

  // Obtener por número de afiliado
  getByNumero: async (numeroAfiliado) => {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/${numeroAfiliado}`);
    const a = res.data;
    if (!a) return null;
    return {
      id: a.id,
      numeroAfiliado: a.numeroAfiliado ?? a.NumeroAfiliado,
      titularID: a.titularID ?? a.titularId,
      planMedicoId: a.planMedicoId ?? a.PlanMedicoId,
      alta: a.alta ?? a.Alta ?? null,
      baja: a.baja ?? a.Baja ?? null,
      integrantes: Array.isArray(a.integrantes)
        ? a.integrantes
        : a.Integrantes ?? [],
    };
  },
  // En el método toggleStatus, asegurar que las fechas tengan hora
  toggleStatus: async (afiliadoID, activo, fecha) => {
    console.log("AfiliadosService.toggleStatus payload:");
    let query = `${ENDPOINT}/toggleStatus/${afiliadoID}?activo=${activo}`;
    if (fecha) query += `&fecha=${fecha}`;
    //Imprimir el query en consola para mostrar como queda
    console.log(query);
    const res = await WebAPI.Instance().patch(query);

    const a = res.data || {};
    return {
      id: a.id,
      numeroAfiliado: a.numeroAfiliado ?? a.NumeroAfiliado,
      titularID: a.titularID ?? a.titularId,
      planMedicoId: a.planMedicoId ?? a.PlanMedicoId,
      alta: a.alta ?? a.Alta ?? null,
      baja: a.baja ?? a.Baja ?? null,
      integrantes: Array.isArray(a.integrantes)
        ? a.integrantes
        : a.Integrantes ?? [],
    };
  },
};
