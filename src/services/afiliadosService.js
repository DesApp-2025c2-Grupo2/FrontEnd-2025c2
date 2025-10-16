import WebAPI from "./config/WebAPI";
const ENDPOINT = "/Afiliados";

export const AfiliadosService = {
  // Obtener todos los afiliados
  getAll: async () => {
    const res = await WebAPI.Instance().get(`${ENDPOINT}`);
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

  create: async (payload) => {
    console.log("AfiliadosService.create payload:", payload);
    const res = await WebAPI.Instance().post(`${ENDPOINT}`, payload);
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

  // Actualizar afiliado
  // update
  update: async (id, payload) => {
    console.log("AfiliadosService.update id, payload:", id, payload);
    const res = await WebAPI.Instance().put(`${ENDPOINT}/${id}`, payload);
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
    // algunos backends devuelven objeto, otros sólo status; devolvemos id para que el slice pueda filtrar
    return { id, data: res.data };
  },

  // Obtener por número de afiliado (si lo necesitas)
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
};