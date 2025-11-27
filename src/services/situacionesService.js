import WebAPI from "./config/WebAPI";

const ENDPOINT = "/sterapeuticas";

export async function getAll() {
  const res = await WebAPI.Instance().get(`${ENDPOINT}/all`);
  return res.data;
}

export async function create(situacion) {
  const { id: _, ...body } = situacion;

  const res = await WebAPI.Instance().post(`${ENDPOINT}/save?id=0`, body);

  return res.data;
}

export async function update(situacion) {
  const id = situacion.id ?? 0;
  const { id: _, ...body } = situacion;

  const res = await WebAPI.Instance().post(`${ENDPOINT}/save?id=${id}`, body);

  return res.data;
}

export async function toggle(id) {
  const res = await WebAPI.Instance().patch(`${ENDPOINT}/toggleStatus/${id}`);
  return res.data;
}
