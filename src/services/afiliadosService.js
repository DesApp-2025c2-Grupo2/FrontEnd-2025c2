import WebAPI from './config/WebAPI';
const ENDPOINT = '/Afiliados';

export const AfiliadosService = {
  // --- Obtener todos los afiliados ---
  getAll: async () => {
    const res = await WebAPI.Instance().get(`${ENDPOINT}`);
    const data = res.data;
    if (!Array.isArray(data)) return [];
    return data.map((a) => ({
      id: a.id,
      numeroAfiliado: a.numeroAfiliado ?? '',
      titularID: a.titularID ?? null,
      planMedicoId: a.planMedicoId ?? null,
      alta: a.alta ?? null,
      baja: a.baja ?? null,
      integrantes: a.integrantes ?? [],
    }));
  },

  // --- Crear un afiliado (titular + integrantes) ---
  create: async (payload) => {
    // payload debe coincidir con la estructura esperada por el backend
    // incluye: NumeroAfiliado, PlanMedicoId, Alta, Baja, Integrantes (titular primero)
    const res = await WebAPI.Instance().post(`${ENDPOINT}`, payload);
    const a = res.data;
    return {
      id: a.id,
      numeroAfiliado: a.numeroAfiliado,
      titularID: a.titularID,
      planMedicoId: a.planMedicoId,
      alta: a.alta,
      baja: a.baja,
      integrantes: a.integrantes ?? [],
    };
  },

  // --- Actualizar afiliado existente ---
  update: async (id, payload) => {
    const res = await WebAPI.Instance().post(`${ENDPOINT}`, { id, ...payload });
    const a = res.data;
    return {
      id: a.id,
      numeroAfiliado: a.numeroAfiliado,
      titularID: a.titularID,
      planMedicoId: a.planMedicoId,
      alta: a.alta,
      baja: a.baja,
      integrantes: a.integrantes ?? [],
    };
  },


  // --- Obtener por numero de afiliado ---
  getByNumero: async (numeroAfiliado) => {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/${numeroAfiliado}`);
    const a = res.data;
    if (!a) return null;
    return {
      id: a.id,
      numeroAfiliado: a.numeroAfiliado,
      titularID: a.titularID,
      planMedicoId: a.planMedicoId,
      alta: a.alta,
      baja: a.baja,
      integrantes: a.integrantes ?? [],
    };
  },
};
