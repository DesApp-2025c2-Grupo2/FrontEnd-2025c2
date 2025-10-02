// Servicio mock para Situaciones Terapéuticas con persistencia en localStorage

const STORAGE_KEY = 'mock_situaciones_terapeuticas_v1';

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function delay(ms = 350) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function getSituaciones() {
  await delay();
  return readAll();
}

export async function ensureSeed(defaultItems = []) {
  const existing = readAll();
  if (!existing || existing.length === 0) {
    writeAll(defaultItems);
    await delay(50);
    return defaultItems;
  }
  return existing;
}

export async function createSituacion(situacion) {
  await delay();
  const items = readAll();
  // Validación de unicidad por nombre (case-insensitive)
  const nombre = String(situacion.nombre).trim().toLowerCase();
  const dup = items.find((s) => String(s.nombre).trim().toLowerCase() === nombre);
  if (dup) {
    throw new Error('Ya existe una situación con el mismo nombre');
  }
  items.unshift(situacion);
  writeAll(items);
  return situacion;
}

export async function updateSituacion(partial) {
  await delay();
  const items = readAll();
  const idx = items.findIndex((s) => s.id === partial.id);
  if (idx !== -1) {
    // Validar unicidad si cambia el nombre
    const nombre = partial.nombre !== undefined
      ? String(partial.nombre).trim().toLowerCase()
      : String(items[idx].nombre).trim().toLowerCase();
    const dup = items.find((s) => s.id !== partial.id && String(s.nombre).trim().toLowerCase() === nombre);
    if (dup) {
      throw new Error('Ya existe otra situación con el mismo nombre');
    }
    items[idx] = { ...items[idx], ...partial };
    writeAll(items);
    return items[idx];
  }
  throw new Error('Situación no encontrada');
}

export async function deleteSituacion(id) {
  await delay();
  const items = readAll();
  const filtered = items.filter((s) => s.id !== id);
  writeAll(filtered);
  return { id };
}

export async function toggleSituacion(id) {
  await delay();
  const items = readAll();
  const idx = items.findIndex((s) => s.id === id);
  if (idx !== -1) {
    items[idx].activa = !items[idx].activa;
    writeAll(items);
    return { ...items[idx] };
  }
  throw new Error('Situación no encontrada');
}

export async function overwriteAll(items) {
  writeAll(items);
  await delay(10);
  return readAll();
}


