import WebAPI from "./config/WebAPI";

const ENDPOINT = "/Prestador";

//
// =========================================================
//   MAPPER PRINCIPAL
// =========================================================
//   Usado en getAll(), create y update
//
export function mapPrestadorFromBackend(p) {
  return {
    id: p.id,
    nombreCompleto: p.nombreCompleto,
    // ROL (0 = Centro Médico, 1 = Profesional)
    rol: p.rol,

    // DOCUMENTACIÓN
    documentacion: p.documentacion || null,
    cuilCuit: p.documentacion?.numero || "",
    tipoDocumento: p.documentacion?.tipoDocumento || 4,

    // TELÉFONOS
    telefonos: (p.telefonos || []).map((t) => ({
      id: t.id,
      numero: t.numero,
    })),

    // EMAILS
    emails: (p.emails || []).map((e) => ({
      id: e.id,
      correo: e.correo,
    })),

    // DIRECCIONES
    direcciones: (p.direcciones || []).map((d) => ({
      id: d.id,
      calle: d.calle,
      altura: d.altura,
      piso: d.piso ?? "",
      departamento: d.departamento ?? "",
      provinciaCiudad: d.provinciaCiudad,
      codigoPostal: d.codigoPostal,
    })),

    // ESPECIALIDADES
    especialidades: p.especialidades || [],
    especialidadesIds: (p.especialidades || []).map((e) => e.id),

    alta: p.alta,
    baja: p.baja,

    matricula: p.matricula ?? null,
    razonSocial: p.razonSocial ?? null,

    tipo: p.rol === 0 ? "Centro Médico" : "Profesional Independiente",
    centroId: p.centro?.id ?? null,
    centro: p.centro,
    profesionales: p.profesionales,

    agendas: p.agendas ?? [],
  };
}

//
// =========================================================
//   GET ALL
// =========================================================
export async function getAll() {
  const res = await WebAPI.Instance().get(`${ENDPOINT}/all`);
  const data = res.data;

  if (!Array.isArray(data)) return [];

  return data.map(mapPrestadorFromBackend);
}

//
// =========================================================
//   MAPEAR PARA ENVÍO
// =========================================================
//
//
export function mapPrestadorRequest(p, esEdicion) {
  return {
    id: esEdicion ? p.id : undefined,

    nombreCompleto: p.nombreCompleto,
    rol: p.tipo === "Centro Médico" ? 0 : 1,

    // Campos opcionales
    matricula: p.matricula ?? null,
    razonSocial: p.razonSocial ?? null,
    centroId: p.centroId ?? null,

    alta: p.alta || new Date().toISOString().split("T")[0],

    especialidades: [...(p.especialidadesIds || [])],

    // DOCUMENTACIÓN
    documentacion: {
      id: esEdicion ? p.documentacion?.id : undefined,
      tipoDocumento: Number(
        p.documentacion?.tipoDocumento ?? p.tipoDocumento ?? 4
      ),
      numero: String(
        p.documentacion?.numero ?? p.cuilCuit ?? "" // nunca undefined
      ),
    },

    telefonos: (p.telefonos || []).map((t) => ({
      id: esEdicion ? t.id : undefined,
      numero: t.numero ?? t,
    })),

    emails: (p.emails || []).map((e) => ({
      id: esEdicion ? e.id : undefined,
      correo: e.correo ?? e,
    })),

    direcciones: (p.direcciones || []).map((d) => ({
      id: esEdicion ? d.id : undefined,
      calle: d.calle,
      altura: d.altura,
      piso: d.piso ?? "",
      departamento: d.departamento ?? "",
      provinciaCiudad: d.provinciaCiudad,
      codigoPostal: Number(d.codigoPostal) || 0,
    })),
  };
}

//
// =========================================================
//   CREAR
// =========================================================
export async function saveNew(form) {
  const payload = mapPrestadorRequest(form, false);

  // Limpiar ids
  delete payload.id;
  if (payload.documentacion) delete payload.documentacion.id;

  payload.telefonos.forEach((t) => delete t.id);
  payload.emails.forEach((e) => delete e.id);
  payload.direcciones.forEach((d) => delete d.id);

  // Campos opcionales
  if (payload.matricula == null) delete payload.matricula;
  if (payload.razonSocial == null) delete payload.razonSocial;
  if (payload.centroId == null) delete payload.centroId;

  const res = await WebAPI.Instance().post(`${ENDPOINT}/saveNew`, payload);

  return mapPrestadorFromBackend(res.data);
}

//
// =========================================================
//   EDITAR
// =========================================================
export async function update(form) {
  const payload = mapPrestadorRequest(form, true);

  if (!payload.id || payload.id <= 0)
    throw new Error("ID es requerido para actualizar.");

  if (payload.matricula == null) delete payload.matricula;
  if (payload.razonSocial == null) delete payload.razonSocial;
  if (payload.centroId == null) delete payload.centroId;

  const res = await WebAPI.Instance().put(`${ENDPOINT}/update`, payload);

  return mapPrestadorFromBackend(res.data);
}

//
// =========================================================
//   AGENDA
// =========================================================
export async function updateAgenda(agenda) {
  const res = await WebAPI.Instance().put(`${ENDPOINT}/agendas/update`, agenda);

  return res.data;
}

//
// =========================================================
//   TOGGLE STATUS
// =========================================================
export async function toggleStatus(id) {
  const res = await WebAPI.Instance().put(`${ENDPOINT}/toggleStatus/${id}`);

  // Mapear la respuesta si el backend devuelve el prestador actualizado
  if (res.data && typeof res.data === "object") {
    return mapPrestadorFromBackend(res.data);
  }

  // Si solo devuelve un booleano o algo simple, devolver eso
  return res.data;
}
