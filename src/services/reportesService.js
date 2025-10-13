// Servicio mock para Reportes con persistencia en sessionStorage

const STORAGE_KEY = 'mock_reportes_v1';

function readAll() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(items) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function delay(ms = 1000) {
  return new Promise((res) => setTimeout(res, ms));
}

// Seeds iniciales
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

export async function ensureSeed() {
  const existing = readAll();
  if (!existing || existing.length === 0) {
    writeAll(seedReportes);
    await delay(50);
    return seedReportes;
  }
  return existing;
}

export async function getHistorialReportes() {
  await delay(300);
  return readAll();
}

export async function generarReporte(datos) {
  await delay(2000); // Simular tiempo de generación
  
  const historial = readAll();
  const maxId = historial.reduce((m, r) => Math.max(m, r.id || 0), 0);
  
  // Obtener el nombre del tipo de reporte
  const tiposReportes = [
    { id: 'alta-afiliados-periodo', nombre: 'Alta de Afiliados por Período' },
    { id: 'alta-prestadores-periodo', nombre: 'Alta de Prestadores por Período' },
    { id: 'prestadores-especialidad-cp', nombre: 'Prestadores por Especialidad y CP' },
    { id: 'situaciones-terapeuticas-afiliado', nombre: 'Situaciones Terapéuticas por Afiliado' },
    { id: 'prestadores-sin-agendas', nombre: 'Prestadores sin Agendas' },
    { id: 'horarios-sin-turnos', nombre: 'Horarios sin Turnos Definidos' }
  ];
  
  const tipoReporte = tiposReportes.find(t => t.id === datos.tipoReporte);
  
  const nuevoReporte = {
    id: maxId + 1,
    tipoReporte: datos.tipoReporte,
    nombre: tipoReporte?.nombre || 'Reporte',
    fechaGeneracion: datos.fechaGeneracion,
    fechaExportacion: null,
    parametros: datos.parametros || {},
    estado: 'generado',
    formatoExportacion: null
  };
  
  historial.unshift(nuevoReporte);
  writeAll(historial);
  
  return nuevoReporte;
}

export async function exportarReporte(datos) {
  await delay(1500); // Simular tiempo de exportación
  
  const historial = readAll();
  const reporte = historial.find(r => r.id === datos.reporteId);
  
  if (!reporte) {
    throw new Error('Reporte no encontrado');
  }
  
  // Actualizar el reporte con la fecha de exportación
  const reporteActualizado = {
    ...reporte,
    fechaExportacion: datos.fechaExportacion,
    estado: 'completado',
    formatoExportacion: datos.formato || 'PDF'
  };
  
  const index = historial.findIndex(r => r.id === datos.reporteId);
  if (index !== -1) {
    historial[index] = reporteActualizado;
    writeAll(historial);
  }
  
  // Simular descarga de archivo
  console.log(`Exportando reporte ${reporte.nombre} en formato ${datos.formato || 'PDF'}`);
  
  return reporteActualizado;
}

export async function eliminarReporte(id) {
  await delay(500);
  
  const historial = readAll();
  const filtered = historial.filter(r => r.id !== id);
  writeAll(filtered);
  
  return { id };
}

export async function obtenerTiposReportes() {
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
    },
    {
      id: 'horarios-sin-turnos',
      nombre: 'Horarios sin Turnos Definidos',
      descripcion: 'Horarios configurados que no tienen turnos asignados'
    }
  ];
}
