// Servicio de Agendas consumiendo backend
import WebAPI from './config/WebAPI';

const ENDPOINT = '/Agenda';
const USE_AGENDAS_MOCK = false; // desactivado por defecto
function canonDia(d) {
  const t = String(d || '').trim().toLowerCase();
  if (!t) return '';
  const base = t.charAt(0).toUpperCase() + t.slice(1);
  if (base === 'Miercoles') return 'Miércoles';
  if (base === 'Sabado') return 'Sábado';
  // Asegurar capitalización de los demás
  const mapping = {
    'lunes': 'Lunes', 'martes': 'Martes', 'miércoles': 'Miércoles', 'miercoles': 'Miércoles',
    'jueves': 'Jueves', 'viernes': 'Viernes', 'sábado': 'Sábado', 'sabado': 'Sábado', 'domingo': 'Domingo'
  };
  return mapping[t] || base;
}


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
  const normalizados = horarios.map((h) => {
    const diasRaw = Array.isArray(h?.diasDeLaSemana) ? h.diasDeLaSemana : (Array.isArray(h?.dias) ? h.dias : []);
    const dias = diasRaw.map(canonDia).filter(Boolean);
    const horaInicio = h?.horaInicio || h?.desde || '';
    const horaFin = h?.horaFin || h?.hasta || '';
    const duracionMinutos = (typeof h?.duracionMinutos === 'number') ? h.duracionMinutos : (baseDuracion ?? 30);
    let especialidades = Array.isArray(h?.especialidades) ? h.especialidades.filter((x) => typeof x === 'number' && x > 0) : [];
    if (especialidades.length === 0 && (typeof h?.especialidadId === 'number' && h.especialidadId > 0)) {
      especialidades = [h.especialidadId];
    } else if (especialidades.length === 0 && (typeof espLugar === 'number' && espLugar > 0)) {
      especialidades = [espLugar];
    }
    const especialidadId = Array.isArray(especialidades) && especialidades.length > 0 ? especialidades[0] : null;
    return { id: h?.id ?? null, dias, horaInicio, horaFin, duracionMinutos, especialidades, especialidadId };
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
    if (USE_AGENDAS_MOCK) {
      const mock = readMockAgendas(profesionalId);
      if (mock.length > 0) return mock;
    }
    return [];
  } catch (_) {
    // Fallback: /Agenda/getByProfesional/{id}
    try {
      const res2 = await WebAPI.Instance().get(`${ENDPOINT}/getByProfesional/${profesionalId}`);
      const data2 = Array.isArray(res2?.data) ? res2.data : [];
      const norm2 = data2.map(normalizeAgendaLugar);
      if (norm2.length > 0) return norm2;
      if (USE_AGENDAS_MOCK) {
        const mock = readMockAgendas(profesionalId);
        if (mock.length > 0) return mock;
      }
      return [];
    } catch {
      if (USE_AGENDAS_MOCK) {
        const mock = readMockAgendas(profesionalId);
        if (mock.length > 0) return mock;
      }
      return [];
    }
  }
}

// Construir payload para PUT /Agenda/{profesionalId}/lugares
function mapLugaresForAPI(lugaresAtencion) {
  const result = [];
  (Array.isArray(lugaresAtencion) ? lugaresAtencion : []).forEach((l) => {
    const direccion = String(l?.direccion || '').trim();
    if (!direccion) return; // no enviar lugares sin dirección
    const horariosSrc = Array.isArray(l?.horarios) ? l.horarios : [];
    const horariosAtencion = horariosSrc
      .filter((h) => {
        const dias = Array.isArray(h?.dias) ? h.dias : [];
        const hi = String(h?.horaInicio || '').trim();
        const hf = String(h?.horaFin || '').trim();
        return dias.length > 0 && hi !== '' && hf !== '' && hf > hi;
      })
      .map((h) => {
        const ids = Array.isArray(h?.especialidades)
          ? h.especialidades.filter((x) => typeof x === 'number')
          : ((typeof h?.especialidadId === 'number') ? [h.especialidadId] : []);
        return {
          id: h?.id ?? null,
          diasDeLaSemana: Array.isArray(h?.dias) ? h.dias.map(canonDia).filter(Boolean) : [],
          horaInicio: h?.horaInicio || '',
          horaFin: h?.horaFin || '',
          duracionMinutos: (typeof h?.duracionMinutos === 'number' && h.duracionMinutos > 0) ? h.duracionMinutos : 30,
          especialidades: ids
        };
      });
    if (horariosAtencion.length === 0) return; // evitar 500 por listas vacías
    result.push({ id: l?.id ?? null, direccion, horariosAtencion });
  });
  return result;
}

// Actualiza lugares y horarios del profesional (reemplazo completo)
export async function updateLugares(profesionalId, lugaresAtencion) {
  try {
    const asArray = mapLugaresForAPI(lugaresAtencion);
    // 1) Ruta preferida y root preferido: /direcciones con array directo
    let res = await WebAPI.Instance().put(`${ENDPOINT}/${profesionalId}/direcciones`, asArray);
    if (!res || !res.data) {
      // 2) Wrapper alternativo
      res = await WebAPI.Instance().put(`${ENDPOINT}/${profesionalId}/direcciones`, { direcciones: asArray });
    }
    if (!res || !res.data) {
      // 3) Compat: /lugares array directo
      res = await WebAPI.Instance().put(`${ENDPOINT}/${profesionalId}/lugares`, asArray);
      if (!res || !res.data) {
        // 4) Compat: /lugares con wrapper
        res = await WebAPI.Instance().put(`${ENDPOINT}/${profesionalId}/lugares`, { lugares: asArray });
      }
    }
    const raw = res?.data;
    const data = Array.isArray(raw)
      ? raw
      : (Array.isArray(raw?.direcciones) ? raw.direcciones : (Array.isArray(raw?.lugares) ? raw.lugares : []));
    return data.map(normalizeAgendaLugar);
  } catch (e) {
    // No mockear para no desincronizar
    throw e;
  }
}


