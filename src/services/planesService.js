import WebAPI from "./config/WebAPI";

const ENDPOINT = "/PlanMedico";

export async function getAll() {
  const res = await WebAPI.Instance().get(`${ENDPOINT}/all`);
  const data = res.data;
  if (!Array.isArray(data)) return [];
  return data.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? "",
    activo: p.activo ?? p.activa ?? true,
    costoMensual: p.costoMensual ?? p.precio ?? 0,
    moneda: p.moneda ?? "ARS",
  }));
}

export async function create(plan) {
  const { id: _, ...body } = plan;

  const res = await WebAPI.Instance().post(`${ENDPOINT}/save?id=0`, body);

  return res.data;
}

export async function update(plan) {
  const id = plan.id ?? 0;
  const { id: _, ...body } = plan;

  const res = await WebAPI.Instance().post(`${ENDPOINT}/save?id=${id}`, body);

  return res.data;
}

export async function toggle(id) {
  const res = await WebAPI.Instance().patch(`${ENDPOINT}/toggleStatus/${id}`);
  return res.data;
}
