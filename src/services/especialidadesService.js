// Servicio mock para Especialidades con persistencia en sessionStorage

const STORAGE_KEY = 'mock_especialidades_v1';

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

function delay(ms = 300) {
  return new Promise((res) => setTimeout(res, ms));
}

// Seeds iniciales
const seedEspecialidades = [
  { id: 1, nombre: 'Cardiología', descripcion: 'Especialidad médica que se ocupa del corazón', activa: false },
  { id: 2, nombre: 'Traumatología', descripcion: 'Trata lesiones del sistema musculoesquelético', activa: true },
  { id: 3, nombre: 'Medicina General', descripcion: 'Atención médica integral y continua', activa: true },
  { id: 4, nombre: 'Pediatría', descripcion: 'Salud de bebés, niños y adolescentes', activa: true },
];

export async function ensureSeed() {
  const existing = readAll();
  if (!existing || existing.length === 0) {
    writeAll(seedEspecialidades);
    await delay(50);
    return seedEspecialidades;
  }
  return existing;
}

export async function getAll() {
  await delay();
  return readAll();
}

export async function create(especialidad) {
  await delay();
  const items = readAll();
  const nombreKey = String(especialidad.nombre || '').trim().toLowerCase();
  if (!nombreKey) throw new Error('Nombre requerido');
  if (items.some(e => String(e.nombre).trim().toLowerCase() === nombreKey)) {
    throw new Error('Ya existe una especialidad con ese nombre');
  }
  const nextId = items.reduce((m, e) => Math.max(m, e.id || 0), 0) + 1;
  const nuevo = { id: nextId, nombre: especialidad.nombre, descripcion: especialidad.descripcion || '', activa: true };
  items.push(nuevo);
  writeAll(items);
  return nuevo;
}

export async function update(partial) {
  await delay();
  const items = readAll();
  const idx = items.findIndex(e => e.id === partial.id);
  if (idx === -1) throw new Error('Especialidad no encontrada');
  const nombreNuevo = partial.nombre !== undefined ? String(partial.nombre).trim().toLowerCase() : String(items[idx].nombre).trim().toLowerCase();
  if (!nombreNuevo) throw new Error('Nombre requerido');
  if (items.some(e => e.id !== partial.id && String(e.nombre).trim().toLowerCase() === nombreNuevo)) {
    throw new Error('Ya existe otra especialidad con ese nombre');
  }
  items[idx] = { ...items[idx], ...partial };
  writeAll(items);
  return items[idx];
}

export async function deleteById(id) {
  await delay();
  const items = readAll();
  const filtered = items.filter(e => e.id !== id);
  writeAll(filtered);
  return { id };
}

export async function toggle(id) {
  await delay();
  const items = readAll();
  const idx = items.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Especialidad no encontrada');
  items[idx].activa = !items[idx].activa;
  writeAll(items);
  return { id, activa: items[idx].activa };
}


