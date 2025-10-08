// Servicio para Especialidades consumiendo backend
import WebAPI from './config/WebAPI';

const ENDPOINT = '/Especialidad';

export async function getAll() {
  const res = await WebAPI.Instance().get(`${ENDPOINT}/all`);
  return res.data;
}

export async function create(especialidad) {
  const res = await WebAPI.Instance().post(`${ENDPOINT}/save`, especialidad);
  return res.data;
}

export async function update(partial) {
  // El backend expone POST /Especialidad/save para crear/actualizar
  const res = await WebAPI.Instance().post(`${ENDPOINT}/save`, partial);
  return res.data;
}

export async function toggle(id) {
  const res = await WebAPI.Instance().patch(`${ENDPOINT}/toggleStatus/${id}`);
  return res.data;
}