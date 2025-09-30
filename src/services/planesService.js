// Servicio mock para Planes Médicos con persistencia en localStorage

const STORAGE_KEY = 'mock_planes_medicos_v1';

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

export async function getPlanes() {
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

export async function createPlan(plan) {
  await delay();
  const items = readAll();
  // Validaciones de unicidad: código y nombre (case-insensitive)
  const codigo = String(plan.codigo).toLowerCase();
  const nombre = String(plan.nombre).trim().toLowerCase();
  const dup = items.find(p => String(p.codigo).toLowerCase() === codigo || String(p.nombre).trim().toLowerCase() === nombre);
  if (dup) {
    throw new Error('Ya existe un plan con el mismo código o nombre');
  }
  items.unshift(plan);
  writeAll(items);
  return plan;
}

export async function updatePlan(partial) {
  await delay();
  const items = readAll();
  const idx = items.findIndex((p) => p.id === partial.id);
  if (idx !== -1) {
    // Validar unicidad si cambian código/nombre
    const codigo = partial.codigo !== undefined ? String(partial.codigo).toLowerCase() : String(items[idx].codigo).toLowerCase();
    const nombre = partial.nombre !== undefined ? String(partial.nombre).trim().toLowerCase() : String(items[idx].nombre).trim().toLowerCase();
    const dup = items.find(p => p.id !== partial.id && (String(p.codigo).toLowerCase() === codigo || String(p.nombre).trim().toLowerCase() === nombre));
    if (dup) {
      throw new Error('Ya existe otro plan con el mismo código o nombre');
    }
    items[idx] = { ...items[idx], ...partial };
    writeAll(items);
    return items[idx];
  }
  throw new Error('Plan no encontrado');
}

export async function deletePlan(id) {
  await delay();
  const items = readAll();
  const filtered = items.filter((p) => p.id !== id);
  writeAll(filtered);
  return { id };
}

export async function togglePlan(id) {
  await delay();
  const items = readAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx !== -1) {
    items[idx].activo = !items[idx].activo;
    writeAll(items);
    return { ...items[idx] };
  }
  throw new Error('Plan no encontrado');
}

export async function overwriteAll(items) {
  writeAll(items);
  await delay(10);
  return readAll();
}


