import WebAPI from './config/WebAPI';

const ENDPOINT = '/Reportes';

// ============================================================================
// MAPEO DE TIPOS DE REPORTE (Frontend string -> Backend int)
// ============================================================================

const TIPO_REPORTE_MAP = {
  'alta-afiliados-periodo': 1,
  'alta-prestadores-periodo': 2,
  'prestadores-especialidad-cp': 3,
  'situaciones-terapeuticas-afiliado': 4,
  'prestadores-sin-agendas': 5
};

const TIPO_REPORTE_REVERSE_MAP = {
  1: 'alta-afiliados-periodo',
  2: 'alta-prestadores-periodo',
  3: 'prestadores-especialidad-cp',
  4: 'situaciones-terapeuticas-afiliado',
  5: 'prestadores-sin-agendas'
};

// ============================================================================
// FUNCIONES DE NORMALIZACIÓN (Backend -> Frontend)
// ============================================================================

/**
 * Normaliza un reporte desde el formato del backend al formato del frontend
 * Backend devuelve: { HexaID, TipoReporte (string), Parametros (string JSON), FechaGeneracion }
 * @param {Object} reporteBackend - Reporte en formato del backend
 * @returns {Object} Reporte normalizado para el frontend
 */
function normalizeReporte(reporteBackend) {
  if (!reporteBackend) return null;

  const hexaId = reporteBackend.hexaID ?? reporteBackend.HexaID ?? reporteBackend.id ?? reporteBackend.Id ?? null;
  const tipoReporteBackend = reporteBackend.tipoReporte ?? reporteBackend.TipoReporte ?? '';
  const parametrosStr = reporteBackend.parametros ?? reporteBackend.Parametros ?? '{}';
  
  // Convertir TipoReporte de string a id del frontend
  let tipoReporte = '';
  if (typeof tipoReporteBackend === 'number') {
    tipoReporte = TIPO_REPORTE_REVERSE_MAP[tipoReporteBackend] || '';
  } else {
    tipoReporte = tipoReporteBackend;
  }

  // Parsear Parametros si viene como string JSON
  let parametros = {};
  try {
    if (typeof parametrosStr === 'string') {
      parametros = JSON.parse(parametrosStr);
    } else {
      parametros = parametrosStr;
    }
  } catch (e) {
    console.warn('Error parseando parámetros del reporte:', e);
    parametros = {};
  }

  return {
    id: hexaId,
    tipoReporte: tipoReporte,
    nombre: reporteBackend.nombre ?? reporteBackend.Nombre ?? 'Reporte',
    fechaGeneracion: reporteBackend.fechaGeneracion ?? reporteBackend.FechaGeneracion ?? null,
    fechaExportacion: reporteBackend.fechaExportacion ?? reporteBackend.FechaExportacion ?? null,
    parametros: parametros,
    estado: reporteBackend.estado ?? reporteBackend.Estado ?? 'generado',
    formatoExportacion: reporteBackend.formatoExportacion ?? reporteBackend.FormatoExportacion ?? null
  };
}

/**
 * Normaliza el payload para enviar al backend según ReporteRequest
 * Backend espera: { TipoReporte (int), FechaDesde (DateTime?), FechaHasta (DateTime?), AfiliadoId (int?) }
 * Solo se envían los campos que corresponden según el tipo de reporte
 * 
 * @param {Object} datosFrontend - Datos en formato del frontend
 * @param {string} datosFrontend.tipoReporte - ID del tipo de reporte (string)
 * @param {Object} datosFrontend.parametros - Parámetros del reporte
 * @returns {Object} Payload para el backend (ReporteRequest) - solo campos relevantes
 */
function toBackendPayload(datosFrontend) {
  const tipoReporteInt = TIPO_REPORTE_MAP[datosFrontend.tipoReporte] || 0;
  const parametros = datosFrontend.parametros || {};

  const payload = {
    TipoReporte: tipoReporteInt
  };

  // Solo agregar FechaDesde y FechaHasta si existen (para reportes por período)
  if (parametros.fechaDesde) {
    payload.FechaDesde = parametros.fechaDesde;
  }

  if (parametros.fechaHasta) {
    payload.FechaHasta = parametros.fechaHasta;
  }

  // Solo agregar AfiliadoId si existe (para reporte de situaciones terapéuticas)
  if (parametros.afiliadoId) {
    const afiliadoIdInt = parseInt(parametros.afiliadoId, 10);
    if (!isNaN(afiliadoIdInt)) {
      payload.AfiliadoId = afiliadoIdInt;
    }
  }

  return payload;
}

// ============================================================================
// FUNCIONES MOCK (Fallback)
// ============================================================================

const STORAGE_KEY = 'mock_reportes_v2';
const USE_MOCK = true;

function readAllMock() {
  if (!USE_MOCK) return [];
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAllMock(items) {
  if (!USE_MOCK) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function delay(ms = 1000) {
  return new Promise((res) => setTimeout(res, ms));
}

// ============================================================================
// SERVICIOS PRINCIPALES
// ============================================================================

/**
 * Obtener todos los reportes generados alguna vez
 * Endpoint: GET /Reportes/all
 * 
 * FLUJO:
 * - El backend consulta la BD y devuelve todos los reportes guardados
 * - Cada reporte incluye: HexaID, TipoReporte (string), Parametros (string JSON), FechaGeneracion
 * - Los reportes deben estar ordenados por fechaGeneracion DESC (más reciente primero)
 * 
 * @returns {Promise<Array>} Array de reportes normalizados ordenados por fecha (más reciente primero)
 */
export async function getHistorialReportes() {
  try {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/all`);
    const data = Array.isArray(res?.data) ? res.data : [];
    return data.map(normalizeReporte).filter(r => r && r.tipoReporte !== 'horarios-sin-turnos');
  } catch (error) {
    console.error('Error al obtener historial de reportes:', error);
    await delay(300);
    const historial = readAllMock();
    const cleaned = (historial || []).filter(r => r.tipoReporte !== 'horarios-sin-turnos');
    if (cleaned.length !== historial.length) {
      writeAllMock(cleaned);
    }
    return cleaned;
  }
}

/**
 * Generar un nuevo reporte
 * Endpoint: POST /Reportes/generate
 * 
 * FLUJO:
 * 1. Frontend envía ReporteRequest al backend: { TipoReporte (int), FechaDesde?, FechaHasta?, AfiliadoId? }
 * 2. Backend recibe los parámetros y ejecuta la consulta SQL con esos filtros
 * 3. Backend genera los datos del reporte según los parámetros recibidos
 * 4. Backend GUARDA en BD: TipoReporte, Parametros (JSON string), FechaGeneracion
 * 5. Backend devuelve el reporte guardado con su HexaID generado
 * 
 * Body: ReporteRequest { TipoReporte: int, FechaDesde?: DateTime, FechaHasta?: DateTime, AfiliadoId?: int }
 * 
 * @param {Object} datos - Datos del reporte a generar
 * @param {string} datos.tipoReporte - ID del tipo de reporte (string del frontend)
 * @param {Object} datos.parametros - Parámetros para filtrar la consulta SQL en el backend
 * @returns {Promise<Object>} Reporte generado y guardado en BD, normalizado
 */
export async function generarReporte(datos) {
  try {
    const payload = toBackendPayload({
      tipoReporte: datos.tipoReporte,
      parametros: datos.parametros || {}
    });
    const res = await WebAPI.Instance().post(`${ENDPOINT}/generate`, payload);
    return normalizeReporte(res.data);
  } catch (error) {
    // Fallback a mock en caso de error
    await delay(2000);
    
    const historial = readAllMock();
    const maxId = historial.reduce((m, r) => Math.max(m, r.id || 0), 0);
    
    const tiposReportes = [
      { id: 'alta-afiliados-periodo', nombre: 'Alta de Afiliados por Período' },
      { id: 'alta-prestadores-periodo', nombre: 'Alta de Prestadores por Período' },
      { id: 'prestadores-especialidad-cp', nombre: 'Prestadores por Especialidad y CP' },
      { id: 'situaciones-terapeuticas-afiliado', nombre: 'Situaciones Terapéuticas por Afiliado' },
      { id: 'prestadores-sin-agendas', nombre: 'Prestadores sin Agendas' }
    ];
    
    const tipoReporte = tiposReportes.find(t => t.id === datos.tipoReporte);
    
    const nuevoReporte = {
      id: maxId + 1,
      tipoReporte: datos.tipoReporte,
      nombre: tipoReporte?.nombre || 'Reporte',
      fechaGeneracion: datos.fechaGeneracion || new Date().toISOString(),
      fechaExportacion: null,
      parametros: datos.parametros || {},
      estado: 'generado',
      formatoExportacion: null
    };
    
    historial.unshift(nuevoReporte);
    writeAllMock(historial);
    
    return nuevoReporte;
  }
}

/**
 * Obtener un reporte específico del historial
 * Endpoint: GET /Reportes/retrieve/{id}
 * 
 * @param {number} id - HexaID del reporte a obtener
 * @returns {Promise<Object>} Reporte normalizado
 */
export async function obtenerReporte(id) {
  try {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/retrieve/${id}`);
    return normalizeReporte(res.data);
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    // Fallback a mock en caso de error
    await delay(300);
    const historial = readAllMock();
    const reporte = historial.find(r => r.id === id);
    if (reporte) {
      return reporte;
    }
    throw new Error('Reporte no encontrado');
  }
}

/**
 * Exportar un reporte (PDF, Excel, etc.)
 * Nota: Esta función puede no estar disponible en el backend actual
 * Endpoint esperado: POST /Reportes/exportar
 * Body esperado: { reporteId: number, formato: string }
 * 
 * @param {Object} datos - Datos de exportación
 * @param {number} datos.reporteId - ID del reporte a exportar
 * @param {string} datos.formato - Formato de exportación ('PDF', 'Excel', etc.)
 * @param {string} datos.fechaExportacion - Fecha de exportación (ISO string)
 * @returns {Promise<Object>} Reporte actualizado con información de exportación
 */
export async function exportarReporte(datos) {
  try {
    const res = await WebAPI.Instance().post(`${ENDPOINT}/exportar`, {
      reporteId: datos.reporteId,
      formato: datos.formato || 'PDF',
      fechaExportacion: datos.fechaExportacion || new Date().toISOString()
    });
    return normalizeReporte(res.data);
  } catch (error) {
    // Fallback a mock en caso de error
    await delay(1500);
    
    const historial = readAllMock();
    const reporte = historial.find(r => r.id === datos.reporteId);
    
    if (!reporte) {
      throw new Error('Reporte no encontrado');
    }
    
    const reporteActualizado = {
      ...reporte,
      fechaExportacion: datos.fechaExportacion || new Date().toISOString(),
      estado: 'completado',
      formatoExportacion: datos.formato || 'PDF'
    };
    
    const index = historial.findIndex(r => r.id === datos.reporteId);
    if (index !== -1) {
      historial[index] = reporteActualizado;
      writeAllMock(historial);
    }
    
    console.log(`Exportando reporte ${reporte.nombre} en formato ${datos.formato || 'PDF'}`);
    
    return reporteActualizado;
  }
}

/**
 * Eliminar un reporte
 * Endpoint esperado: DELETE /Reportes/{id}
 * 
 * @param {number} id - ID del reporte a eliminar
 * @returns {Promise<Object>} { id: number }
 */
export async function eliminarReporte(id) {
  try {
    await WebAPI.Instance().delete(`${ENDPOINT}/${id}`);
    return { id };
  } catch (error) {
    // Fallback a mock en caso de error
    await delay(500);
    const historial = readAllMock();
    const filtered = historial.filter(r => r.id !== id);
    writeAllMock(filtered);
    return { id };
  }
}

/**
 * Obtener tipos de reportes disponibles
 * Endpoint esperado: GET /Reportes/tipos
 * 
 * @returns {Promise<Array>} Array de tipos de reportes disponibles
 */
export async function obtenerTiposReportes() {
  try {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/tipos`);
    return Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener tipos de reportes:', error);
    // Fallback a lista por defecto en caso de error
    await delay(200);
    return [
      {
        id: 'alta-afiliados-periodo',
        nombre: 'Alta de Afiliados por Período',
        descripcion: 'Reporte de nuevos afiliados registrados en un período específico'
      },
      {
        id: 'alta-prestadores-periodo',
        nombre: 'Alta de Prestadores por Período',
        descripcion: 'Reporte de nuevos prestadores registrados en un período específico'
      },
      {
        id: 'prestadores-especialidad-cp',
        nombre: 'Prestadores por Especialidad y CP',
        descripcion: 'Distribución de prestadores por especialidad y código postal'
      },
      {
        id: 'situaciones-terapeuticas-afiliado',
        nombre: 'Situaciones Terapéuticas por Afiliado',
        descripcion: 'Reporte de situaciones terapéuticas por afiliado'
      },
      {
        id: 'prestadores-sin-agendas',
        nombre: 'Prestadores sin Agendas',
        descripcion: 'Listado de prestadores que no tienen agendas configuradas'
      }
    ];
  }
}

export async function ensureSeed() {
  if (!USE_MOCK) return [];
  
  const existing = readAllMock();
  const cleaned = (existing || []).filter(r => r.tipoReporte !== 'horarios-sin-turnos');
  
  if (!existing || existing.length === 0 || cleaned.length !== existing.length) {
const seedReportes = [
  {
    id: 1,
    tipoReporte: 'alta-afiliados-periodo',
    nombre: 'Alta de Afiliados por Período',
    fechaGeneracion: '2024-01-15T14:30:00Z',
    fechaExportacion: '2024-01-15T14:35:00Z',
    parametros: {
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-01-15'
    },
    estado: 'completado',
    formatoExportacion: 'PDF'
  },
  {
    id: 2,
    tipoReporte: 'prestadores-especialidad-cp',
    nombre: 'Prestadores por Especialidad y CP',
    fechaGeneracion: '2024-01-14T09:15:00Z',
    fechaExportacion: '2024-01-14T09:20:00Z',
    parametros: {
      especialidades: ['Cardiología', 'Traumatología'],
      codigosPostales: ['1000', '2000']
    },
    estado: 'completado',
    formatoExportacion: 'Excel'
  },
  {
    id: 3,
    tipoReporte: 'prestadores-sin-agendas',
    nombre: 'Prestadores sin Agendas',
    fechaGeneracion: '2024-01-13T16:45:00Z',
    fechaExportacion: null,
    parametros: {},
    estado: 'generado',
    formatoExportacion: null
  }
];

    const toWrite = cleaned.length > 0 && cleaned.length === existing.length 
      ? cleaned 
      : seedReportes;
    writeAllMock(toWrite);
    await delay(50);
    return toWrite;
  }
  return cleaned;
}