import WebAPI from "./config/WebAPI";
const ENDPOINT = "/Afiliados";

<<<<<<< HEAD
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
    // Envuelve el payload en un objeto "request"
    const requestPayload = { request: payload };
    const res = await WebAPI.Instance().post(`${ENDPOINT}`, requestPayload);
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
  update: async (id, payload) => {
    // Envuelve el payload en un objeto "request"
    const requestPayload = { request: payload };
    const res = await WebAPI.Instance().put(
      `${ENDPOINT}/${id}`,
      requestPayload
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
=======
const AFILIADOS_ENDPOINT = "/Afiliados";
const PERSONAS_ENDPOINT = "/Personas";

const normalizeAfiliado = (afiliado) => {
  return {
    ...afiliado,
    id: afiliado.id,
    titularId: afiliado.titularId || afiliado.titularID, // Normalizar mayúscula
  };
};

export async function getAllAfiliados() {
  const res = await WebAPI.Instance().get(AFILIADOS_ENDPOINT);
  const afiliados = Array.isArray(res.data) ? res.data : [];
  return afiliados.map(normalizeAfiliado);
}

export async function getAfiliadoByNumero(numeroAfiliado) {
  const res = await WebAPI.Instance().get(
    `${AFILIADOS_ENDPOINT}/${numeroAfiliado}`
  );
  return normalizeAfiliado(res.data);
}

export async function createAfiliado(afiliado) {
  const res = await WebAPI.Instance().post(AFILIADOS_ENDPOINT, afiliado);
  return normalizeAfiliado(res.data);
}

export async function updateAfiliado(id, partial) {
  const res = await WebAPI.Instance().put(
    `${AFILIADOS_ENDPOINT}/${id}`,
    partial
  );
  return normalizeAfiliado(res.data);
}

export async function darBajaAfiliado(id, fechaBaja) {
  const res = await WebAPI.Instance().put(`${AFILIADOS_ENDPOINT}/${id}`, {
    baja: fechaBaja || new Date().toISOString().split("T")[0],
  });
  return normalizeAfiliado(res.data);
}

export async function reactivarAfiliado(id) {
  const res = await WebAPI.Instance().put(`${AFILIADOS_ENDPOINT}/${id}`, {
    baja: null,
  });
  return normalizeAfiliado(res.data);
}

export async function createPersona(persona) {
  const res = await WebAPI.Instance().post(PERSONAS_ENDPOINT, persona);
  return res.data;
}

export async function getPersona(id) {
  const res = await WebAPI.Instance().get(`${PERSONAS_ENDPOINT}/${id}`);
  return res.data;
}

export async function updatePersona(id, partial) {
  const res = await WebAPI.Instance().put(
    `${PERSONAS_ENDPOINT}/${id}`,
    partial
  );
  return res.data;
}

export async function darBajaPersona(id, fechaBaja) {
  const res = await WebAPI.Instance().put(`${PERSONAS_ENDPOINT}/${id}`, {
    baja: fechaBaja || new Date().toISOString().split("T")[0],
  });
  return res.data;
}

export async function reactivarPersona(id) {
  const res = await WebAPI.Instance().put(`${PERSONAS_ENDPOINT}/${id}`, {
    baja: null,
  });
  return res.data;
}

export const AfiliadosService = {
  createAfiliadoCompleto: async (
    formAfiliado,
    editTelefonos = [],
    editEmails = [],
    editDirecciones = [],
    editSituaciones = []
  ) => {
    try {
      // 1. Primero crear la persona titular
      const personaPayload = {
        numeroIntegrante: 1,
        nombre: formAfiliado.nombre,
        apellido: formAfiliado.apellido,
        tipoDocumento: formAfiliado.tipoDocumento,
        numeroDocumento: formAfiliado.numeroDocumento,
        fechaNacimiento: formAfiliado.fechaNacimiento,
        parentesco: 1,
        afiliadoId: 0, // Temporal, se actualiza después
        alta: formAfiliado.alta,
        baja: null,
        telefonos: editTelefonos || [],
        emails: editEmails || [],
        direcciones: editDirecciones || [],
        situacionesTerapeuticas: editSituaciones || [],
      };

      const personaResult = await createPersona(personaPayload);

      // 2. Luego crear el afiliado
      const afiliadoPayload = {
        titularId: personaResult.id,
        planMedicoId: parseInt(formAfiliado.planMedicoId),
        alta: formAfiliado.alta,
        baja: null,
      };

      const afiliadoResult = await createAfiliado(afiliadoPayload);

      // 3. Actualizar la persona con el afiliadoId correcto (ahora tenemos el id real)
      await updatePersona(personaResult.id, {
        afiliadoId: afiliadoResult.id,
      });

      // Retornar con estructura normalizada
      return {
        afiliado: normalizeAfiliado(afiliadoResult),
        persona: {
          ...personaResult,
          afiliadoId: afiliadoResult.id,
        },
      };
    } catch (error) {
      console.error("Error creating afiliado completo:", error);
      throw error;
    }
  },

  /**
   * Actualiza un afiliado existente y su persona titular
   */
  updateAfiliadoCompleto: async (
    selectedAfiliado,
    formAfiliado,
    editTelefonos = [],
    editEmails = [],
    editDirecciones = [],
    editSituaciones = []
  ) => {
    if (!selectedAfiliado) throw new Error("Afiliado no seleccionado");

    try {
      const afiliadoId = selectedAfiliado.id;

      const afiliadoUpdate = {
        planMedicoId: parseInt(formAfiliado.planMedicoId),
        alta: formAfiliado.alta,
        baja: selectedAfiliado.baja,
      };

      const afiliadoResult = await updateAfiliado(afiliadoId, afiliadoUpdate);
      const titularId =
        selectedAfiliado.titularId || selectedAfiliado.titularID;
      if (!titularId) {
        return {
          afiliado: normalizeAfiliado(afiliadoResult),
          persona: null,
        };
      }

      const personaUpdate = {
        nombre: formAfiliado.nombre,
        apellido: formAfiliado.apellido,
        tipoDocumento: formAfiliado.tipoDocumento,
        numeroDocumento: formAfiliado.numeroDocumento,
        fechaNacimiento: formAfiliado.fechaNacimiento,
        telefonos: editTelefonos || [],
        emails: editEmails || [],
        direcciones: editDirecciones || [],
        situacionesTerapeuticas: editSituaciones || [],
      };

      const personaResult = await updatePersona(titularId, personaUpdate);

      return {
        afiliado: normalizeAfiliado(afiliadoResult),
        persona: personaResult,
      };
    } catch (error) {
      console.error("Error updating afiliado:", error);
      throw error;
    }
  },

  formatNumeroAfiliado: (numero) => {
    return String(numero).padStart(7, "0");
  },
};

export default {
  getAllAfiliados,
  getAfiliadoByNumero,
  createAfiliado,
  updateAfiliado,
  darBajaAfiliado,
  reactivarAfiliado,
  createPersona,
  getPersona,
  updatePersona,
  darBajaPersona,
  reactivarPersona,
  AfiliadosService,
};
>>>>>>> 87bc780cb0493b4c159170398b95ddf7b1927c74
