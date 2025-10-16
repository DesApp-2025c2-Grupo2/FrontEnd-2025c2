// Servicio de Agendas consumiendo backend
import WebAPI from './config/WebAPI';

const ENDPOINT = '/Agenda';

function normalizeAgendaLugar(item) {
  return {
    id: item?.id ?? null, // id del lugar/agenda
    direccion: item?.direccion || '',
    especialidadId: item?.especialidadId ?? null,
    horarios: Array.isArray(item?.horariosAtencion)
      ? item.horariosAtencion.map((h) => ({
          dias: Array.isArray(h?.diasDeLaSemana) ? h.diasDeLaSemana : [],
          horaInicio: h?.horaInicio || '',
          horaFin: h?.horaFin || '',
          duracionMinutos: typeof item?.duracionConsulta === 'number' ? item.duracionConsulta : 30,
        }))
      : [],
  };
}

export async function getByProfesional(profesionalId) {
  // Versión principal: query param (según tu back)
  try {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/getByProfesional`, { params: { profesionalId, id: profesionalId } });
    const data = Array.isArray(res?.data) ? res.data : [];
    return data.map(normalizeAgendaLugar);
  } catch (_) {
    // Fallback: /Agenda/getByProfesional/{id}
    try {
      const res2 = await WebAPI.Instance().get(`${ENDPOINT}/getByProfesional/${profesionalId}`);
      const data2 = Array.isArray(res2?.data) ? res2.data : [];
      return data2.map(normalizeAgendaLugar);
    } catch {
      return [];
    }
  }
}


