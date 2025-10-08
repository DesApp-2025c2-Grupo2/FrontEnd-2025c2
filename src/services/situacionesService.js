// Servicio para Situaciones Terapéuticas consumiendo backend
import WebAPI from './config/WebAPI';

const ENDPOINT = '/sterapeuticas';

export async function getAll() {
  const res = await WebAPI.Instance().get(`${ENDPOINT}/all`);
  return res.data;
}

export async function create(situacion) {
  const res = await WebAPI.Instance().post(`${ENDPOINT}/save`, situacion);
  return res.data;
}

export async function update(partial) {
  // El backend expone POST /sterapeuticas/save para crear/actualizar
  const res = await WebAPI.Instance().post(`${ENDPOINT}/save`, partial);
  return res.data;
}

export async function toggle(id) {
  const res = await WebAPI.Instance().patch(`${ENDPOINT}/toggleStatus/${id}`);
  return res.data;
}
