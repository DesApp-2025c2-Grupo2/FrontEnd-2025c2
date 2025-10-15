// services/afiliadosService.js
import WebAPI from "./config/WebAPI";

// Endpoints
const AFILIADOS_ENDPOINT = "/afiliados";
const PERSONAS_ENDPOINT = "/personas";

// Servicios básicos de Afiliados
export async function getAllAfiliados() {
  const res = await WebAPI.Instance().get(AFILIADOS_ENDPOINT);
  return res.data;
}

export async function getAfiliadoByNumero(numeroAfiliado) {
  const res = await WebAPI.Instance().get(
    `${AFILIADOS_ENDPOINT}/${numeroAfiliado}`
  );
  return res.data;
}

export async function createAfiliado(afiliado) {
  const res = await WebAPI.Instance().post(AFILIADOS_ENDPOINT, afiliado);
  return res.data;
}

export async function updateAfiliado(id, partial) {
  const res = await WebAPI.Instance().put(
    `${AFILIADOS_ENDPOINT}/${id}`,
    partial
  );
  return res.data;
}

export async function darBajaAfiliado(id, fechaBaja) {
  const res = await WebAPI.Instance().put(`${AFILIADOS_ENDPOINT}/${id}`, {
    baja: fechaBaja || new Date().toISOString().split("T")[0],
  });
  return res.data;
}

export async function reactivarAfiliado(id) {
  const res = await WebAPI.Instance().put(`${AFILIADOS_ENDPOINT}/${id}`, {
    baja: null,
  });
  return res.data;
}

// Servicios básicos de Personas
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

/**
 * Servicio de utilidades para operaciones compuestas
 * Mantiene la lógica de negocio coordinada
 */
export const AfiliadosService = {
  /**
   * Crea un nuevo afiliado con su persona titular (operación compuesta)
   */
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
        numeroIntegrante: 1, // titular siempre 1
        nombre: formAfiliado.nombre,
        apellido: formAfiliado.apellido,
        tipoDocumento: formAfiliado.tipoDocumento,
        numeroDocumento: formAfiliado.numeroDocumento,
        fechaNacimiento: formAfiliado.fechaNacimiento,
        parentesco: 1, // Titular
        afiliadoId: 0, // Se actualizará después
        alta: formAfiliado.alta,
        baja: null,
        telefonos: (editTelefonos || []).map((telefono, index) => ({
          id: index + 1,
          numero: telefono,
        })),
        emails: (editEmails || []).map((email, index) => ({
          id: index + 1,
          correo: email,
        })),
        direcciones: (editDirecciones || []).map((direccion, index) => ({
          id: index + 1,
          calle: (direccion || "").split(",")[0]?.trim() || direccion || "",
          altura: "",
          piso: "",
          departamento: "",
          provinciaCiudad: "Buenos Aires",
        })),
        situacionesTerapeuticas: editSituaciones || [],
      };

      const personaResult = await createPersona(personaPayload);

      // 2. Luego crear el afiliado referenciando a la persona
      const afiliadoPayload = {
        numeroAfiliado: 0, // El backend asignará el número
        titularId: personaResult.id,
        planMedicoId: parseInt(formAfiliado.planMedicoId),
        alta: formAfiliado.alta,
        baja: null,
        integrantes: [personaResult.id],
      };

      const afiliadoResult = await createAfiliado(afiliadoPayload);

      // 3. Actualizar la persona con el afiliadoId correcto
      await updatePersona(personaResult.id, {
        afiliadoId: afiliadoResult.id,
      });

      // Retornar el afiliado completo con el titular incluido
      return {
        afiliado: {
          ...afiliadoResult,
          titular: { ...personaResult, afiliadoId: afiliadoResult.id },
        },
        persona: { ...personaResult, afiliadoId: afiliadoResult.id },
      };
    } catch (error) {
      console.error("Error creating afiliado completo:", error);
      throw error;
    }
  },

  /**
   * Actualiza un afiliado existente y su persona titular (operación compuesta)
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
      // 1. Actualizar afiliado
      const afiliadoUpdate = {
        planMedicoId: parseInt(formAfiliado.planMedicoId),
        alta: formAfiliado.alta,
        baja: selectedAfiliado.baja,
      };

      const afiliadoResult = await updateAfiliado(
        selectedAfiliado.id,
        afiliadoUpdate
      );

      // 2. Actualizar persona titular
      const titularId =
        selectedAfiliado.titularId || selectedAfiliado.titularID;
      if (!titularId) {
        return { afiliado: afiliadoResult, persona: null };
      }

      const personaUpdate = {
        nombre: formAfiliado.nombre,
        apellido: formAfiliado.apellido,
        tipoDocumento: formAfiliado.tipoDocumento,
        numeroDocumento: formAfiliado.numeroDocumento,
        fechaNacimiento: formAfiliado.fechaNacimiento,
        telefonos: (editTelefonos || []).map((telefono, index) => ({
          id: index + 1,
          numero: telefono,
        })),
        emails: (editEmails || []).map((email, index) => ({
          id: index + 1,
          correo: email,
        })),
        direcciones: (editDirecciones || []).map((direccion, index) => ({
          id: index + 1,
          calle: (direccion || "").split(",")[0]?.trim() || direccion || "",
          altura: "",
          piso: "",
          departamento: "",
          provinciaCiudad: "Buenos Aires",
        })),
        situacionesTerapeuticas: editSituaciones || [],
      };

      const personaResult = await updatePersona(titularId, personaUpdate);

      return {
        afiliado: afiliadoResult,
        persona: personaResult,
      };
    } catch (error) {
      console.error("Error updating afiliado:", error);
      throw error;
    }
  },

  /**
   * Utilidades de formato
   */
  formatNumeroAfiliado: (numero) => {
    return String(numero).padStart(7, "0");
  },
};

// Exportar todo junto para mantener compatibilidad
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
