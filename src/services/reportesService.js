import WebAPI from './config/WebAPI';

const ENDPOINT = '/Reportes';

// ============================================================================
// FUNCIONES DE NORMALIZACIÓN (Backend -> Frontend)
// ============================================================================

/**
 * Normaliza un reporte desde el formato del backend al formato del frontend
 * @param {Object} reporteBackend - Reporte en formato del backend
 * @returns {Object} Reporte normalizado para el frontend
 */
function normalizeReporte(reporteBackend) {
  if (!reporteBackend) return null;

  return {
    id: reporteBackend.id ?? reporteBackend.Id ?? null,
    tipoReporte: reporteBackend.tipoReporte ?? reporteBackend.TipoReporte ?? '',
    nombre: reporteBackend.nombre ?? reporteBackend.Nombre ?? 'Reporte',
    fechaGeneracion: reporteBackend.fechaGeneracion ?? reporteBackend.FechaGeneracion ?? null,
    fechaExportacion: reporteBackend.fechaExportacion ?? reporteBackend.FechaExportacion ?? null,
    parametros: reporteBackend.parametros ?? reporteBackend.Parametros ?? {},
    estado: reporteBackend.estado ?? reporteBackend.Estado ?? 'generado',
    formatoExportacion: reporteBackend.formatoExportacion ?? reporteBackend.FormatoExportacion ?? null
  };
}

/**
 * Normaliza el payload para enviar al backend
 * Los parámetros se envían tal cual al backend para que ejecute la consulta SQL filtrada
 * 
 * @param {Object} datosFrontend - Datos en formato del frontend
 * @returns {Object} Payload para el backend
 */
function toBackendPayload(datosFrontend) {
  return {
    tipoReporte: datosFrontend.tipoReporte,
    parametros: datosFrontend.parametros || {}, // Se envían al backend para filtrar la consulta SQL
    fechaGeneracion: datosFrontend.fechaGeneracion || new Date().toISOString() // Opcional, backend puede generarla
  };
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
 * Obtener historial de reportes desde la base de datos
 * Endpoint esperado: GET /Reportes/historial
 * 
 * FLUJO:
 * - El backend consulta la BD y devuelve todos los reportes guardados
 * - Cada reporte incluye: id, tipoReporte, nombre, fechaGeneracion, fechaExportacion,
 *   parametros (los que se usaron para generar), estado, formatoExportacion
 * - Los reportes deben estar ordenados por fechaGeneracion DESC (más reciente primero)
 * 
 * @returns {Promise<Array>} Array de reportes normalizados ordenados por fecha (más reciente primero)
 */
export async function getHistorialReportes() {
  try {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/historial`);
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
 * Endpoint esperado: POST /Reportes/generar
 * 
 * FLUJO:
 * 1. Frontend envía tipoReporte + parámetros al backend
 * 2. Backend recibe los parámetros y ejecuta la consulta SQL con esos filtros
 * 3. Backend genera los datos del reporte según los parámetros recibidos
 * 4. Backend GUARDA en BD: tipoReporte, parámetros, fechaGeneracion, estado='generado'
 * 5. Backend devuelve el reporte guardado con su ID generado
 * 
 * Body esperado: { tipoReporte: string, parametros: object }
 * 
 * @param {Object} datos - Datos del reporte a generar
 * @param {string} datos.tipoReporte - ID del tipo de reporte
 * @param {Object} datos.parametros - Parámetros para filtrar la consulta SQL en el backend
 * @param {string} datos.fechaGeneracion - Fecha de generación (ISO string) - opcional, backend puede generarla
 * @returns {Promise<Object>} Reporte generado y guardado en BD, normalizado
 */
export async function generarReporte(datos) {
  try {
    const payload = toBackendPayload({
      tipoReporte: datos.tipoReporte,
      parametros: datos.parametros || {},
      fechaGeneracion: datos.fechaGeneracion || new Date().toISOString()
    });
    const res = await WebAPI.Instance().post(`${ENDPOINT}/generar`, payload);
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
 * Exportar un reporte (PDF, Excel, etc.)
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