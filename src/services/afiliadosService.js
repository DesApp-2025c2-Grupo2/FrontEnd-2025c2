import { addAfiliado } from "../store/afiliadosSlice";
import {
  addPersona,
  updatePersona,
  updateAfiliadoIdPersona,
} from "../store/personasSlice";

/**
 * Servicio de utilidades para operaciones compuestas relacionadas con afiliados/personas.
 * Nota: numeroAfiliado se mantiene como número entero (1,2,3,..). El formateo a 7 dígitos
 * se hace en las vistas cuando sea necesario.
 */
export const AfiliadosService = {
  createAfiliado: (
    dispatch,
    formAfiliado,
    editTelefonos = [],
    editEmails = [],
    editDirecciones = [],
    editSituaciones = [],
    afiliados = []
  ) => {
    // calcular el siguiente numeroAfiliado (numérico, secuencial)
    const maxNumeroAfiliado = Math.max(
      0,
      ...afiliados.map((a) => Number(a.numeroAfiliado) || 0)
    );
    const nuevoNumeroAfiliado = maxNumeroAfiliado + 1; // <-- entero secuencial

    // genId para id internos (string): mantiene la separación id vs numeroAfiliado
    const genId = (prefix) => {
      try {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
          return `${prefix}-${crypto.randomUUID()}`;
        }
      } catch {
        // fallback
      }
      return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    };

    const nuevaPersonaId = genId("p");
    const nuevoAfiliadoId = genId("a");

    const personaPayload = {
      id: nuevaPersonaId,
      numeroIntegrante: 1, // titular siempre 1
      nombre: formAfiliado.nombre,
      apellido: formAfiliado.apellido,
      tipoDocumento: formAfiliado.tipoDocumento,
      numeroDocumento: formAfiliado.numeroDocumento,
      fechaNacimiento: formAfiliado.fechaNacimiento,
      parentesco: 1,
      afiliadoId: nuevoAfiliadoId,
      alta: formAfiliado.alta,
      baja: null,
      telefonos: editTelefonos,
      emails: editEmails,
      direcciones: editDirecciones,
      situacionesTerapeuticas: editSituaciones || [],
    };

    dispatch(addPersona(personaPayload));

    const afiliadoPayload = {
      id: nuevoAfiliadoId,
      numeroAfiliado: nuevoNumeroAfiliado, // <-- aquí va el número secuencial
      titularId: nuevaPersonaId,
      planMedicoId: formAfiliado.planMedicoId,
      alta: formAfiliado.alta,
      baja: null,
      situacionesTerapeuticas: editSituaciones || [],
    };

    dispatch(addAfiliado(afiliadoPayload));

    return { afiliado: afiliadoPayload, persona: personaPayload };
  },

  updateAfiliadoExisting: (
    dispatch,
    selectedAfiliado,
    formAfiliado,
    editTelefonos = [],
    editEmails = [],
    editDirecciones = [],
    editSituaciones = [],
    personas = []
  ) => {
    if (!selectedAfiliado) return null;

    // actualizar plan y alta si cambian
    if (
      formAfiliado.planMedicoId &&
      formAfiliado.planMedicoId !== selectedAfiliado.planMedicoId
    ) {
      dispatch({
        type: "afiliados/updatePlanMedicoAfiliado",
        payload: {
          afiliadoId: selectedAfiliado.id,
          planMedicoId: formAfiliado.planMedicoId,
        },
      });
    }

    if (formAfiliado.alta && formAfiliado.alta !== selectedAfiliado.alta) {
      dispatch({
        type: "afiliados/updateAltaAfiliado",
        payload: {
          afiliadoId: selectedAfiliado.id,
          fechaAlta: formAfiliado.alta,
        },
      });
    }

    // actualizar titular
    const titular = personas.find((p) => p.id === selectedAfiliado.titularId);
    if (titular) {
      const personaUpdate = {
        ...titular,
        nombre: formAfiliado.nombre,
        apellido: formAfiliado.apellido,
        fechaNacimiento: formAfiliado.fechaNacimiento,
        telefonos: editTelefonos,
        emails: editEmails,
        direcciones: editDirecciones,
        situacionesTerapeuticas:
          editSituaciones || titular.situacionesTerapeuticas || [],
      };
      dispatch(updatePersona(personaUpdate));
      if (titular.afiliadoId !== selectedAfiliado.id) {
        dispatch(
          updateAfiliadoIdPersona({
            personaId: titular.id,
            afiliadoId: selectedAfiliado.id,
          })
        );
      }
    }

    // sincronizar lista de situaciones sobre el afiliado
    dispatch({
      type: "afiliados/setSituacionesAfiliado",
      payload: {
        afiliadoId: selectedAfiliado.id,
        situaciones: editSituaciones || [],
      },
    });

    return true;
  },
};
