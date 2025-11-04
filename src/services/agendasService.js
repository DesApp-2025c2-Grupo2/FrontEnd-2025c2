// Servicio de Agendas consumiendo backend
import WebAPI from './config/WebAPI';

const ENDPOINT = '/Agenda';

function readMockAgendas(profesionalId) {
  try {
    const raw = sessionStorage.getItem('mock_agendas_by_profesional');
    if (!raw) return [];
    const map = JSON.parse(raw);
    if (!map || typeof map !== 'object') return [];
    const porId = map[String(profesionalId)];
    if (Array.isArray(porId)) return porId.map(normalizeAgendaLugar);
    const comodin = map['*'];
    if (Array.isArray(comodin)) return comodin.map(normalizeAgendaLugar);
    return [];
  } catch {
    return [];
  }
}

function normalizeAgendaLugar(item) {
  const baseDuracion = (typeof item?.duracionConsulta === 'number') ? item.duracionConsulta : null;
  const espLugar = (typeof item?.especialidadId === 'number') ? item.especialidadId : null;
  const horarios = Array.isArray(item?.horariosAtencion) ? item.horariosAtencion : [];
  const normalizados = [];
  horarios.forEach((h) => {
    const dias = Array.isArray(h?.diasDeLaSemana) ? h.diasDeLaSemana : (Array.isArray(h?.dias) ? h.dias : []);
    const horaInicio = h?.horaInicio || h?.desde || '';
    const horaFin = h?.horaFin || h?.hasta || '';
    const duracionMinutos = (typeof h?.duracionMinutos === 'number') ? h.duracionMinutos : (baseDuracion ?? 30);
    const especialidades = Array.isArray(h?.especialidades) ? h.especialidades.filter((x) => typeof x === 'number') : [];
    if (especialidades.length > 0) {
      especialidades.forEach((espId) => {
        normalizados.push({ dias, horaInicio, horaFin, duracionMinutos, especialidadId: espId });
      });
    } else {
      const esp = (typeof h?.especialidadId === 'number') ? h.especialidadId : espLugar;
      normalizados.push({ dias, horaInicio, horaFin, duracionMinutos, especialidadId: (typeof esp === 'number' ? esp : null) });
    }
  });
  return {
    id: item?.id ?? null, // id del lugar/agenda
    direccion: item?.direccion || '',
    horarios: normalizados,
  };
}

export async function getByProfesional(profesionalId) {
  // Versión principal: query param (según tu back)
  try {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/getByProfesional`, { params: { profesionalId, id: profesionalId } });
    const data = Array.isArray(res?.data) ? res.data : [];
    const norm = data.map(normalizeAgendaLugar);
    if (norm.length > 0) return norm;
    const mock = readMockAgendas(profesionalId);
    if (mock.length > 0) return mock;
    return [];
  } catch (_) {
    // Fallback: /Agenda/getByProfesional/{id}
    try {
      const res2 = await WebAPI.Instance().get(`${ENDPOINT}/getByProfesional/${profesionalId}`);
      const data2 = Array.isArray(res2?.data) ? res2.data : [];
      const norm2 = data2.map(normalizeAgendaLugar);
      if (norm2.length > 0) return norm2;
      const mock = readMockAgendas(profesionalId);
      if (mock.length > 0) return mock;
      return [];
    } catch {
      const mock = readMockAgendas(profesionalId);
      if (mock.length > 0) return mock;
      return [];
    }
  }
}


