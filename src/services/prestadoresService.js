// Servicio para Prestadores: intenta backend y cae a mock (sessionStorage) si falla
import WebAPI from './config/WebAPI';
import * as especialidadesService from './especialidadesService';

const ENDPOINT = '/Prestador';

const STORAGE_KEY = 'mock_prestadores_v1';

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

function delay(ms = 350) {
  return new Promise((res) => setTimeout(res, ms));
}

// Seeds iniciales (sin codigoPostal ni tipo en teléfonos/emails)
const seedPrestadores = [
  {
    id: 1,
    cuilCuit: '20-12345678-9',
    nombreCompleto: 'Dra. Tita Merello',
    tipo: 'Profesional Independiente',
    integraCentroMedicoId: null,
    especialidades: [
      { id: 1, nombre: 'Cardiología' },
      { id: 3, nombre: 'Medicina General' }
    ],
    telefonos: [
      { numero: '011-4567-8901' },
      { numero: '011-4567-8902' }
    ],
    emails: [
      { email: 'tmerello@clinica.com' }
    ],
    lugaresAtencion: [
      {
        id: 1,
        direccion: 'Avenida Vergara 1908, CABA',
        especialidadesPermitidas: [],
        horarios: [
          { dias: ['Lunes', 'Miércoles'], horaInicio: '08:00', horaFin: '14:00', duracionMinutos: 30 },
          { dias: ['Viernes'], horaInicio: '09:00', horaFin: '13:00', duracionMinutos: 30 }
        ]
      }
    ],
    activo: true
  },
  {
    id: 2,
    cuilCuit: '20-98765432-1',
    nombreCompleto: 'Dr. Carlos Mendez',
    tipo: 'Profesional Independiente',
    integraCentroMedicoId: null,
    especialidades: [
      { id: 2, nombre: 'Traumatología' }
    ],
    telefonos: [
      { numero: '011-5678-9012' }
    ],
    emails: [
      { email: 'cmendez@hospital.com' }
    ],
    lugaresAtencion: [
      {
        id: 1,
        direccion: 'Rivadavia 2345, CABA',
        especialidadesPermitidas: [],
        horarios: [
          { dias: ['Martes', 'Jueves'], horaInicio: '14:00', horaFin: '20:00', duracionMinutos: 30 },
          { dias: ['Jueves'], horaInicio: '08:00', horaFin: '12:00', duracionMinutos: 30 }
        ]
      }
    ],
    activo: true
  },
  {
    id: 3,
    cuilCuit: '30-11223344-5',
    nombreCompleto: 'Dr. Roberto Silva',
    tipo: 'Profesional Independiente',
    integraCentroMedicoId: null,
    especialidades: [
      { id: 4, nombre: 'Clínico' }
    ],
    telefonos: [
      { numero: '011-6789-0123' }
    ],
    emails: [
      { email: 'rsilva@medico.com' }
    ],
    lugaresAtencion: [
      {
        id: 1,
        direccion: 'Corrientes 1234, CABA',
        especialidadesPermitidas: [],
        horarios: [
          { dias: ['Lunes', 'Miércoles', 'Viernes'], horaInicio: '08:00', horaFin: '12:00', duracionMinutos: 30 },
          { dias: ['Miércoles'], horaInicio: '14:00', horaFin: '18:00', duracionMinutos: 30 }
        ]
      },
      {
        id: 2,
        direccion: 'Santa Fe 5678, CABA',
        especialidadesPermitidas: [],
        horarios: [
          { dias: ['Lunes', 'Martes', 'Jueves'], horaInicio: '14:00', horaFin: '18:00', duracionMinutos: 30 },
          { dias: ['Martes'], horaInicio: '08:00', horaFin: '12:00', duracionMinutos: 30 }
        ]
      },
      {
        id: 3,
        direccion: 'Callao 9012, CABA',
        especialidadesPermitidas: [],
        horarios: [
          { dias: ['Martes', 'Miércoles', 'Viernes'], horaInicio: '08:00', horaFin: '12:00', duracionMinutos: 30 },
          { dias: ['Martes'], horaInicio: '14:00', horaFin: '18:00', duracionMinutos: 30 }
        ]
      }
    ],
    activo: true
  },
  {
    id: 4,
    cuilCuit: '27-33445566-0',
    nombreCompleto: 'Dra. Laura Gómez',
    tipo: 'Profesional Independiente',
    integraCentroMedicoId: null,
    especialidades: [
      { id: 1, nombre: 'Cardiología' },
      { id: 4, nombre: 'Clínico' }
    ],
    telefonos: [
      { numero: '011-4455-6677' }
    ],
    emails: [
      { email: 'lgomez@consultorio.com' }
    ],
    lugaresAtencion: [
      {
        id: 1,
        direccion: 'Av. San Martín 1500, CABA',
        especialidadesPermitidas: [],
        horarios: [
          { dias: ['Lunes', 'Jueves'], horaInicio: '09:00', horaFin: '13:00', duracionMinutos: 20 },
          { dias: ['Martes'], horaInicio: '15:00', horaFin: '19:00', duracionMinutos: 20 }
        ]
      }
    ],
    activo: true
  },
  {
    id: 5,
    cuilCuit: '30-55667788-2',
    nombreCompleto: 'Centro Médico San Martín',
    tipo: 'Centro Médico',
    integraCentroMedicoId: null,
    especialidades: [
      { id: 2, nombre: 'Traumatología' },
      { id: 3, nombre: 'Medicina General' }
    ],
    telefonos: [
      { numero: '011-4000-1122' }
    ],
    emails: [
      { email: 'contacto@cmsanmartin.com' }
    ],
    lugaresAtencion: [
      {
        id: 1,
        direccion: 'San Martín 2500, CABA',
        especialidadesPermitidas: [],
        horarios: [
          { dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horaInicio: '08:00', horaFin: '16:00', duracionMinutos: 30 }
        ]
      }
    ],
    activo: true
  }
];

export async function getAll() {
  // Intentar backend primero
  try {
    const [res, catalogo] = await Promise.all([
      WebAPI.Instance().get(`${ENDPOINT}/getAll`),
      especialidadesService.getAll().catch(() => [])
    ]);
    const data = Array.isArray(res?.data) ? res.data : [];
    const idToNombre = new Map((catalogo || []).map(e => [e.id, e.nombre]));
    const normalizados = data.map((p) => normalizeFromBackend(p, idToNombre));
    return normalizados;
  } catch (_) {
    // Fallback a mock local
    await delay();
    return readAll();
  }
}

function toBackendPayload(prestador, options = {}) {
  const { includeLugares = true, includeDirecciones = true } = options;
  const idsFromEspecialidades = Array.isArray(prestador?.especialidades)
    ? prestador.especialidades
        .map((e) => (typeof e === 'number' ? e : (e && e.id)))
        .filter((id) => typeof id === 'number')
    : [];
  const base = {
    nombreCompleto: prestador?.nombreCompleto || '',
    rol: prestador?.tipo === 'Centro Médico' ? 2 : 1,
    centroMedico: prestador?.centroMedico || '',
    especialidadesIds: idsFromEspecialidades,
    documentacion: prestador?.cuilCuit || '',
    telefonos: Array.isArray(prestador?.telefonos) ? prestador.telefonos.map(t => t?.numero).filter(Boolean) : [],
    emails: Array.isArray(prestador?.emails) ? prestador.emails.map(e => e?.email).filter(Boolean) : [],
  };
  if (includeDirecciones) {
    base.direcciones = Array.isArray(prestador?.lugaresAtencion) ? prestador.lugaresAtencion.map(l => l?.direccion).filter(Boolean) : [];
  }
  if (!includeLugares) return base;
  return {
    ...base,
    // Estructura completa (para crear o cuando el back lo acepte en update)
    lugaresAtencion: Array.isArray(prestador?.lugaresAtencion)
      ? prestador.lugaresAtencion.map((l) => ({
          direccion: l?.direccion || '',
          horarios: Array.isArray(l?.horarios)
            ? l.horarios.map((h) => ({
                dias: Array.isArray(h?.dias) ? h.dias : [],
                horaInicio: h?.horaInicio || '',
                horaFin: h?.horaFin || '',
                duracionMinutos: typeof h?.duracionMinutos === 'number' ? h.duracionMinutos : 30,
                especialidadId: (h?.especialidadId !== undefined && h?.especialidadId !== null)
                  ? Number(h.especialidadId)
                  : null,
              }))
            : [],
        }))
      : [],
  };
}

function normalizeFromBackend(p, idToNombre) {
  const especialidades = Array.isArray(p?.especialidades)
    ? p.especialidades.map(id => ({ id, nombre: idToNombre.get(id) || String(id) }))
    : (Array.isArray(p?.especialidadesIds)
        ? p.especialidadesIds.map(id => ({ id, nombre: idToNombre.get(id) || String(id) }))
        : []);

  const buildHorarios = (origenLugar) => {
    const durLugar = typeof origenLugar?.duracionConsulta === 'number' ? origenLugar.duracionConsulta : null;
    const espLugar = (typeof origenLugar?.especialidadId === 'number') ? origenLugar.especialidadId : null;
    const src = Array.isArray(origenLugar?.horariosAtencion)
      ? origenLugar.horariosAtencion
      : (Array.isArray(origenLugar?.horarios) ? origenLugar.horarios : []);
    const out = [];
    src.forEach((h) => {
      const dias = Array.isArray(h?.diasDeLaSemana) ? h.diasDeLaSemana : (Array.isArray(h?.dias) ? h.dias : []);
      const horaInicio = h?.horaInicio || h?.desde || '';
      const horaFin = h?.horaFin || h?.hasta || '';
      const duracionMinutos = (typeof h?.duracionMinutos === 'number') ? h.duracionMinutos : (typeof durLugar === 'number' ? durLugar : 30);
      const especialidades = Array.isArray(h?.especialidades) ? h.especialidades.filter((x) => typeof x === 'number') : [];
      if (especialidades.length > 0) {
        especialidades.forEach((espId) => out.push({ dias, horaInicio, horaFin, duracionMinutos, especialidadId: espId }));
      } else {
        const esp = (typeof h?.especialidadId === 'number') ? h.especialidadId : espLugar;
        out.push({ dias, horaInicio, horaFin, duracionMinutos, especialidadId: (typeof esp === 'number' ? esp : null) });
      }
    });
    return out;
  };

  let lugaresAtencion = [];
  if (Array.isArray(p?.lugaresAtencion)) {
    lugaresAtencion = p.lugaresAtencion.map((l) => ({
      id: l?.id ?? null,
      direccion: l?.direccion || (([l?.calle, l?.altura].filter(Boolean).join(' ') || l?.calle || '')),
      horarios: buildHorarios(l),
    }));
  } else if (Array.isArray(p?.direcciones)) {
    lugaresAtencion = p.direcciones.map((d) => ({
      id: d?.id || null,
      direccion: (typeof d === 'string') ? d : (([d?.calle, d?.altura].filter(Boolean).join(' ') || d?.calle || d?.direccion || '')),
      horarios: buildHorarios(d),
    }));
  }

  return {
    id: p.id,
    cuilCuit: p?.documentacion?.numero || p?.documentacion || '',
    nombreCompleto: p?.nombreCompleto || '',
    tipo: (p?.rol === 2 ? 'Centro Médico' : 'Profesional Independiente'),
    integraCentroMedicoId: null,
    especialidades,
    telefonos: Array.isArray(p?.telefonos) ? p.telefonos.map(t => ({ numero: t?.numero || t })) : [],
    emails: Array.isArray(p?.emails) ? p.emails.map(e => ({ email: e?.correo || e })) : [],
    lugaresAtencion,
    activo: true,
  };
}

export async function ensureSeed() {
  const existing = readAll();
  if (!existing || existing.length === 0) {
    writeAll(seedPrestadores);
    await delay(50);
    return seedPrestadores;
  }
  // Migración liviana: mover integraCentroMedico (nombre) -> integraCentroMedicoId (id existente)
  const centros = existing.filter(p => p.tipo === 'Centro Médico');
  const migrados = existing.map(p => {
    if (p.tipo === 'Profesional Independiente') {
      if (p.integraCentroMedicoId !== undefined) return p;
      if (p.integraCentroMedico) {
        const match = centros.find(c => c.nombreCompleto === p.integraCentroMedico);
        return { ...p, integraCentroMedicoId: match ? match.id : null };
      }
      return { ...p, integraCentroMedicoId: p.integraCentroMedicoId ?? null };
    }
    return p;
  });
  // Migración adicional: asegurar duracionMinutos por defecto en horarios
  const migrados2 = migrados.map(p => {
    const lugares = Array.isArray(p.lugaresAtencion) ? p.lugaresAtencion.map(l => ({
      ...l,
      especialidadesPermitidas: Array.isArray(l.especialidadesPermitidas) ? l.especialidadesPermitidas : [],
      especialidadSeleccionada: typeof l.especialidadSeleccionada === 'string' ? l.especialidadSeleccionada : null,
      horarios: Array.isArray(l.horarios) ? l.horarios.map(h => ({
        ...h,
        duracionMinutos: typeof h.duracionMinutos === 'number' && h.duracionMinutos > 0 ? h.duracionMinutos : 30
      })) : []
    })) : [];
    return { ...p, lugaresAtencion: lugares };
  });
  writeAll(migrados2);
  return migrados2;
}

export async function create(prestador) {
  try {
    const payload = toBackendPayload(prestador, { includeLugares: true });
    // Nuevo endpoint principal
    let res = await WebAPI.Instance().post(`${ENDPOINT}`, payload);
    if (!res || !res.data) {
      // Fallback a /save
      res = await WebAPI.Instance().post(`${ENDPOINT}/save`, payload);
    }
    const creado = res?.data;
    // 1) Si devuelve objeto con id
    const catalogo = await especialidadesService.getAll().catch(() => []);
    const idToNombre = new Map((catalogo || []).map(e => [e.id, e.nombre]));
    if (creado && typeof creado === 'object' && creado.id) {
      return normalizeFromBackend(creado, idToNombre);
    }
    // 2) Si devuelve solo un ID numérico
    if (typeof creado === 'number') {
      // Volver a cargar lista y devolver ese ítem
      const todos = await getAll();
      const match = todos.find(p => p.id === creado);
      return match || todos;
    }
    // 3) Si devuelve true/OK o sin body pero status 2xx, recargar
    if ((res && res.status && res.status >= 200 && res.status < 300)) {
      const todos = await getAll();
      // Buscar por CUIL/CUIT
      const cuilLower = String(prestador.cuilCuit || '').toLowerCase();
      const match = todos.find(p => String(p.cuilCuit || '').toLowerCase() === cuilLower);
      return match || todos;
    }
  } catch (_) {
    // fallback a mock local
  }
  // mock local
  await delay();
  const items = readAll();
  const maxId = items.reduce((m, p) => Math.max(m, p.id || 0), 0);
  const cuilLower = String(prestador.cuilCuit).toLowerCase();
  if (items.some(p => String(p.cuilCuit).toLowerCase() === cuilLower)) {
    throw new Error('Ya existe un prestador con el mismo CUIL/CUIT');
  }
  const nuevo = { ...prestador, id: maxId + 1, activo: true };
  items.push(nuevo);
  writeAll(items);
  return nuevo;
}

export async function update(partial) {
  try {
    const payload = toBackendPayload(partial, { includeLugares: false, includeDirecciones: false });
    // Preferir PUT /Prestador/{id}
    let res = null;
    if (partial && partial.id != null) {
      try {
        res = await WebAPI.Instance().put(`${ENDPOINT}/${partial.id}`, payload);
      } catch {
        // fallback abajo
      }
    }
    if (!res) {
      res = await WebAPI.Instance().post(`${ENDPOINT}/save`, payload);
    }
    const actualizado = res?.data || null;
    if (actualizado && actualizado.id) {
      const catalogo = await especialidadesService.getAll().catch(() => []);
      const idToNombre = new Map((catalogo || []).map(e => [e.id, e.nombre]));
      return normalizeFromBackend(actualizado, idToNombre);
    }
  } catch (_) {
    // fallback a mock local
  }
  await delay();
  const items = readAll();
  const idx = items.findIndex(p => p.id === partial.id);
  if (idx === -1) throw new Error('Prestador no encontrado');
  const newCuil = partial.cuilCuit !== undefined ? String(partial.cuilCuit).toLowerCase() : String(items[idx].cuilCuit).toLowerCase();
  if (items.some(p => p.id !== partial.id && String(p.cuilCuit).toLowerCase() === newCuil)) {
    throw new Error('Ya existe otro prestador con el mismo CUIL/CUIT');
  }
  items[idx] = { ...items[idx], ...partial };
  writeAll(items);
  return items[idx];
}

export async function deleteById(id) {
  await delay();
  const items = readAll();
  const filtered = items.filter(p => p.id !== id);
  writeAll(filtered);
  return { id };
}

export async function toggleActivo(id) {
  await delay();
  const items = readAll();
  const idx = items.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Prestador no encontrado');
  items[idx].activo = !items[idx].activo;
  writeAll(items);
  return { id, activo: items[idx].activo };
}

export async function overwriteAll(items) {
  writeAll(items);
  await delay(10);
  return readAll();
}

function toHorariosUpdatePayload(lugaresAtencion) {
  return (Array.isArray(lugaresAtencion) ? lugaresAtencion : []).map((l) => ({
    id: l?.id ?? null,
    direccion: l?.direccion || '',
    horariosAtencion: Array.isArray(l?.horarios)
      ? l.horarios.map((h) => ({
          diasDeLaSemana: Array.isArray(h?.dias) ? h.dias : [],
          horaInicio: h?.horaInicio || '',
          horaFin: h?.horaFin || '',
          duracionMinutos: (typeof h?.duracionMinutos === 'number') ? h.duracionMinutos : 30,
          especialidades: (typeof h?.especialidadId === 'number') ? [h.especialidadId] : [],
        }))
      : [],
  }));
}

export async function updateHorarios(id, lugaresAtencion) {
  try {
    const payload = toHorariosUpdatePayload(lugaresAtencion);
    const res = await WebAPI.Instance().put(`${ENDPOINT}/${id}/horarios`, payload);
    return res?.data || { id, lugaresAtencion };
  } catch (_) {
    // Fallback: actualizar mock local
    await delay();
    const items = readAll();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Prestador no encontrado');
    const copia = { ...items[idx] };
    copia.lugaresAtencion = Array.isArray(lugaresAtencion) ? JSON.parse(JSON.stringify(lugaresAtencion)) : [];
    items[idx] = copia;
    writeAll(items);
    return { id, lugaresAtencion: copia.lugaresAtencion };
  }
}


