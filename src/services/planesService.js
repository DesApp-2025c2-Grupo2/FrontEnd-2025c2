// Servicio para Planes Médicos consumiendo backend
import WebAPI from './config/WebAPI';

const ENDPOINT = '/PlanMedico';

export async function getAll() {
  const res = await WebAPI.Instance().get(`${ENDPOINT}/all`);
  const data = res.data;
  if (!Array.isArray(data)) return [];
  return data.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? '',
    activo: (p.activo ?? p.activa) ?? true,
    costoMensual: p.costoMensual ?? p.precio ?? 0,
    moneda: p.moneda ?? 'ARS',
  }));
}

export async function create(plan) {
  const res = await WebAPI.Instance().post(`${ENDPOINT}/save`, plan);
  const p = res.data || plan;
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? plan.descripcion ?? '',
    activo: (p.activo ?? p.activa) ?? plan.activo ?? true,
    costoMensual: p.costoMensual ?? p.precio ?? plan.costoMensual ?? 0,
    moneda: p.moneda ?? plan.moneda ?? 'ARS',
  };
}

export async function update(partial) {
  // El backend expone POST /PlanMedico/save para crear/actualizar
  const res = await WebAPI.Instance().post(`${ENDPOINT}/save`, partial);
  const p = res.data || partial;
  return {
    id: p.id,
    nombre: p.nombre ?? partial.nombre,
    descripcion: p.descripcion ?? partial.descripcion ?? '',
    activo: (p.activo ?? p.activa) ?? partial.activo ?? true,
    costoMensual: p.costoMensual ?? p.precio ?? partial.costoMensual ?? 0,
    moneda: p.moneda ?? partial.moneda ?? 'ARS',
  };
}

export async function deletePlan(id) {
  // Puede que el backend no tenga borrado; dejamos tentativa por si existe
  const res = await WebAPI.Instance().delete(`${ENDPOINT}/${id}`);
  return res.data;
}

export async function toggle(id) {
  const res = await WebAPI.Instance().patch(`${ENDPOINT}/toggleStatus/${id}`);
  return res.data;
}
