import WebAPI from "./config/WebAPI";

const ENDPOINT = "/Reporte";

const TIPO_REPORTE_MAP = {
  "alta-afiliados-periodo": 1,
  "alta-prestadores-periodo": 2,
  "prestadores-especialidad-cp": 3,
  "situaciones-terapeuticas-afiliado": 4,
  "prestadores-sin-agendas": 5,
};

const TIPO_REPORTE_REVERSE_MAP = {
  1: "alta-afiliados-periodo",
  2: "alta-prestadores-periodo",
  3: "prestadores-especialidad-cp",
  4: "situaciones-terapeuticas-afiliado",
  5: "prestadores-sin-agendas",
};

const BACKEND_ENUM_TO_FRONT_ID = {
  AltaAfiliadosPorPeriodo: "alta-afiliados-periodo",
  AltaPrestadoresPorPeriodo: "alta-prestadores-periodo",
  PrestadoresPorEspecialidadYCodigoPostal: "prestadores-especialidad-cp",
  SituacionesTerapeuticasPorAfiliado: "situaciones-terapeuticas-afiliado",
  PrestadoresSinAgendas: "prestadores-sin-agendas",
};

function normalizeReporte(reporteBackend) {
  if (!reporteBackend) return null;

  const hexaId = reporteBackend.hexaID ?? null;

  const backendTipo = reporteBackend.tipoReporte ?? "";
  const tipoReporte = BACKEND_ENUM_TO_FRONT_ID[backendTipo] ?? "";

  // Parámetros string → objeto
  let parametros = {};
  const raw = reporteBackend.parametros ?? "";

  if (raw.includes(":")) {
    raw.split(",").forEach((p) => {
      const [k, v] = p.split(":").map((x) => x.trim());
      parametros[k] = v;
    });
  }

  return {
    id: hexaId,
    tipoReporte, // ✔ ahora sí coincide exacto con keys de TIPO_REPORTE_MAP
    nombre: `Reporte ${backendTipo}`,
    fechaGeneracion: reporteBackend.fechaGeneracion ?? null,
    parametros,
    estado: "generado",
    fileURL: reporteBackend.fileURL || null,
  };
}

function toBackendPayload(datosFrontend) {
  const tipoReporteInt = TIPO_REPORTE_MAP[datosFrontend.tipoReporte] || 0;
  const parametros = datosFrontend.parametros || {};

  const payload = {
    TipoReporte: tipoReporteInt,
  };

  if (parametros.fechaDesde) payload.FechaDesde = parametros.fechaDesde;
  if (parametros.fechaHasta) payload.FechaHasta = parametros.fechaHasta;

  if (parametros.afiliadoId) {
    const afiliadoIdInt = parseInt(parametros.afiliadoId, 10);
    if (!isNaN(afiliadoIdInt)) payload.AfiliadoId = afiliadoIdInt;
  }

  return payload;
}

export async function getHistorialReportes() {
  const res = await WebAPI.Instance().get(`${ENDPOINT}/all`);

  const raw = Array.isArray(res.data) ? res.data : res.data?.reportes ?? [];

  return raw.map(normalizeReporte);
}

export async function generarReporte(datos) {
  const payload = toBackendPayload({
    tipoReporte: datos.tipoReporte,
    parametros: datos.parametros || {},
  });

  const response = await WebAPI.Instance().post(
    `${ENDPOINT}/generate`,
    payload,
    { responseType: "blob" }
  );

  let filename = "reporte.pdf";
  const disposition = response.headers["content-disposition"];

  if (disposition) {
    const match = disposition.match(/filename="(.+)"/);
    if (match) filename = match[1];
  }

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);

  return {
    id: filename.replace("reporte_", "").replace(".pdf", ""),
    tipoReporte: datos.tipoReporte,
    nombre: filename,
    fechaGeneracion: new Date().toISOString(),
    parametros: datos.parametros,
    estado: "generado",
  };
}

export async function exportarReporte(datos) {
  const hexaId = datos.reporteId;
  const tipoReporteInt = TIPO_REPORTE_MAP[datos.tipoReporte] || 0;
  const response = await WebAPI.Instance().get(`${ENDPOINT}/regenerate?hexaId=${hexaId}&tipo=${tipoReporteInt}`);
  return response.data.fileURL || "";
}
