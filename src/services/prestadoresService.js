// Servicio mock para Prestadores con persistencia en sessionStorage

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
  }
];

export async function getAll() {
  await delay();
  return readAll();
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
  await delay();
  const items = readAll();
  const idx = items.findIndex(p => p.id === partial.id);
  if (idx === -1) throw new Error('Prestador no encontrado');
  // Validar unicidad de CUIL/CUIT si cambia
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


