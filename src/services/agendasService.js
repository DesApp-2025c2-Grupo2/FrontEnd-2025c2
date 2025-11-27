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
  const baseDuracion =
    (typeof item?.duracionConsulta === 'number') ? item.duracionConsulta :
    (typeof item?.duracionMinutos === 'number') ? item.duracionMinutos :
    null;
  const espLugar = (typeof item?.especialidadId === 'number') ? item.especialidadId : null;
  const horarios = Array.isArray(item?.horariosAtencion) ? item.horariosAtencion : [];
  const normalizados = horarios.map((h) => {
    const diasRaw = Array.isArray(h?.diasDeLaSemana) ? h.diasDeLaSemana : (Array.isArray(h?.dias) ? h.dias : []);
    const dias = diasRaw.map(canonDia).filter(Boolean);
    const horaInicio = h?.horaInicio || h?.desde || '';
    const horaFin = h?.horaFin || h?.hasta || '';
    const duracionMinutos =
      (typeof h?.duracionMinutos === 'number') ? h.duracionMinutos :
      (typeof h?.duracionConsulta === 'number') ? h.duracionConsulta :
      (baseDuracion ?? 30);
    let especialidades = Array.isArray(h?.especialidades) ? h.especialidades.filter((x) => typeof x === 'number' && x > 0) : [];
    if (especialidades.length === 0 && (typeof h?.especialidadId === 'number' && h.especialidadId > 0)) {
      especialidades = [h.especialidadId];
    } else if (especialidades.length === 0 && (typeof espLugar === 'number' && espLugar > 0)) {
      especialidades = [espLugar];
    }
    const especialidadId = Array.isArray(especialidades) && especialidades.length > 0 ? especialidades[0] : null;
    // Backend ahora puede devolver prestadorId; mapearlo a profesionalId para la UI
    const pid = (typeof h?.profesionalId === 'number') ? h.profesionalId : (typeof h?.prestadorId === 'number' ? h.prestadorId : null);
    const profesionalId = (typeof pid === 'number' && pid > 0) ? pid : null;
    return { id: h?.id ?? null, dias, horaInicio, horaFin, duracionMinutos, especialidades, especialidadId, profesionalId };
  });
  return {
    id: item?.id ?? item?.lugarId ?? item?.lugarAtencionId ?? null, // id del lugar/agenda
    direccion: item?.direccion || '',
    horarios: normalizados,
  };
}

export async function getByProfesional(profesionalId) {
  // Versión principal: query param (según tu back)
  try {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/getByProfesional/${profesionalId}` );
    const raw = res?.data;
    const data = Array.isArray(raw)
      ? raw
      : (Array.isArray(raw?.direcciones) ? raw.direcciones : (Array.isArray(raw?.lugares) ? raw.lugares : []));
    const norm = (Array.isArray(data) ? data : []).map(normalizeAgendaLugar);
    if (norm.length > 0) return norm;
    if (USE_AGENDAS_MOCK) {
      const mock = readMockAgendas(profesionalId);
      if (mock.length > 0) return mock;
    }
    return [];
  } catch (_) {
    // Fallbacks alternativos
    try {
      const res2 = await WebAPI.Instance().get(`${ENDPOINT}/getByProfesional`, { params: { profesionalId } });
      const raw2 = res2?.data;
      const data2 = Array.isArray(raw2)
        ? raw2
        : (Array.isArray(raw2?.direcciones) ? raw2.direcciones : (Array.isArray(raw2?.lugares) ? raw2.lugares : []));
      const norm2 = (Array.isArray(data2) ? data2 : []).map(normalizeAgendaLugar);
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

// GET /Agenda/getByCentro/{centroId}
export async function getByCentro(centroId) {
  try {
    const res = await WebAPI.Instance().get(`${ENDPOINT}/getByCentro/${centroId}`);
    const raw = res?.data;
    // Formato 1 (original): { centroId, profesionales: [{ profesionalId, nombreCompleto, direcciones: [...] }] }
    const profesionales = Array.isArray(raw?.profesionales) ? raw.profesionales : null;
    if (profesionales && profesionales.length > 0) {
      return profesionales.map((p) => {
        const dirsRaw = Array.isArray(p?.direcciones) ? p.direcciones : [];
        const dirsNorm = dirsRaw.map(normalizeAgendaLugar);
        return {
          profesionalId: p?.profesionalId ?? p?.id,
          nombreCompleto: p?.nombreCompleto || '',
          direcciones: dirsNorm
        };
      });
    }

    // Formato 2 (nuevo): { centroId, direcciones: [{ lugarId, detalleDireccion, horariosAtencion: [...] }] }
    const dirsCentro = Array.isArray(raw?.direcciones) ? raw.direcciones : null;
    if (dirsCentro && dirsCentro.length > 0) {
      // Agrupar por profesional (prestadorId en cada horarioAtencion)
      const byProf = new Map(); // profId|null -> { profesionalId, direcciones: [ rawDir ] }
      dirsCentro.forEach((d) => {
        const det = d?.detalleDireccion || {};
        const mainId = (typeof (d?.lugarId ?? det?.id ?? d?.id) === 'number')
          ? (d?.lugarId ?? det?.id ?? d?.id)
          : null;
        // Ignorar lugares inconsistentes con id 0 o sin identificador real
        if (!(typeof mainId === 'number' && mainId > 0)) {
          return;
        }
        const composed = [det.calle, det.altura].filter(Boolean).join(' ').trim();
        const direccion = composed || det.direccion || '';
        const baseDir = {
          id: mainId,
          lugarId: mainId,
          direccion,
        };
        const horarios = Array.isArray(d?.horariosAtencion) ? d.horariosAtencion : [];
        horarios.forEach((h) => {
          const pidRaw = (typeof h?.profesionalId === 'number')
            ? h.profesionalId
            : (typeof h?.prestadorId === 'number' ? h.prestadorId : null);
          const profId = (typeof pidRaw === 'number' && pidRaw > 0) ? pidRaw : null;
          const key = profId == null ? 'null' : String(profId);
          let entry = byProf.get(key);
          if (!entry) {
            entry = { profesionalId: profId, direcciones: [] };
            byProf.set(key, entry);
          }
          // Buscar si ya tenemos esta dirección en este profesional
          let dirNode = entry.direcciones.find((x) =>
            (x.id != null && baseDir.id != null && String(x.id) === String(baseDir.id)) ||
            (x.lugarId != null && baseDir.lugarId != null && String(x.lugarId) === String(baseDir.lugarId)) ||
            (x.direccion && baseDir.direccion && String(x.direccion).trim().toLowerCase() === String(baseDir.direccion).trim().toLowerCase())
          );
          if (!dirNode) {
            dirNode = { ...baseDir, horariosAtencion: [] };
            entry.direcciones.push(dirNode);
          }
          dirNode.horariosAtencion.push(h);
        });
      });

      const result = Array.from(byProf.values()).map((p) => {
        const dirsNorm = p.direcciones.map((rawDir) =>
          normalizeAgendaLugar({
            id: rawDir.id,
            lugarId: rawDir.lugarId,
            direccion: rawDir.direccion,
            horariosAtencion: rawDir.horariosAtencion,
          })
        );
        return {
          profesionalId: p.profesionalId,
          nombreCompleto: '',
          direcciones: dirsNorm,
        };
      });
      return result;
    }
    return [];
  } catch (_) {
    return [];
  }
}

// Construir payload para PUT /Agenda/{id}/direcciones
function mapLugaresForAPI(lugaresAtencion, options = {}) {
  const { isCentro = false } = options;
  const result = [];
  (Array.isArray(lugaresAtencion) ? lugaresAtencion : []).forEach((l) => {
    // Para el backend: siempre requiere lugarId válido
    const lugarId = l?.id ?? l?.lugarId ?? null;
    if (lugarId == null) return;
    const direccion = String(l?.direccion || '').trim();
    const horariosSrc = Array.isArray(l?.horarios) ? l.horarios : [];
    const horariosAtencion = horariosSrc
      .filter((h) => {
        const dias = Array.isArray(h?.dias) ? h.dias : [];
        const hi = String(h?.horaInicio || '').trim();
        const hf = String(h?.horaFin || '').trim();
        const profOK = isCentro ? (typeof h?.profesionalId === 'number') : true;
        return dias.length > 0 && hi !== '' && hf !== '' && hf > hi && profOK;
      })
      .map((h) => {
        const ids = Array.isArray(h?.especialidades)
          ? h.especialidades.filter((x) => typeof x === 'number')
          : ((typeof h?.especialidadId === 'number') ? [h.especialidadId] : []);
        const out = {
          id: h?.id ?? null,
          diasDeLaSemana: Array.isArray(h?.dias) ? h.dias.map(canonDia).filter(Boolean) : [],
          horaInicio: h?.horaInicio || '',
          horaFin: h?.horaFin || '',
          duracionConsulta: (typeof h?.duracionMinutos === 'number' && h.duracionMinutos > 0) ? h.duracionMinutos : 30,
          especialidades: ids,
          ...(ids.length > 0 ? { especialidadId: ids[0] } : {})
        };
        if (isCentro && typeof h?.profesionalId === 'number') {
          out.profesionalId = h.profesionalId;
        }
        out.deleted = typeof h?.deleted === 'boolean' ? h.deleted : false;
        return out;
      });
    result.push({ lugarId, horariosAtencion });
  });
  return result;
}

// Actualiza lugares y horarios (Centro o Profesional) usando /Agenda/{id}/direcciones
export async function updateLugares(id, lugaresAtencion, options = {}) {
  const { isCentro = false, strategy = 'merge', removeIds = [] } = options;
  const direcciones = mapLugaresForAPI(lugaresAtencion, { isCentro });
  try {
    // 1) Contract principal: PUT /Agenda/{id}/direcciones con wrapper { direcciones: [...] }
    const url = `${ENDPOINT}/${id}/direcciones${strategy ? `?strategy=${encodeURIComponent(strategy)}` : ''}`;
    const body = { direcciones, removeIds: Array.isArray(removeIds) ? removeIds : [] };
    // eslint-disable-next-line no-console
    console.debug('Agenda PUT payload', { url, isCentro, body });
    let res = await WebAPI.Instance().put(url, body);
    const raw = res?.data;
    let data = Array.isArray(raw)
      ? raw
      : (Array.isArray(raw?.direcciones) ? raw.direcciones : (Array.isArray(raw?.lugares) ? raw.lugares : []));
    if (Array.isArray(data) && data.length >= 0) {
      return data.map(normalizeAgendaLugar);
    }
    // 2) Mismo endpoint, sin wrapper
    try {
      res = await WebAPI.Instance().put(url, direcciones);
      const raw2 = res?.data;
      data = Array.isArray(raw2)
        ? raw2
        : (Array.isArray(raw2?.direcciones) ? raw2.direcciones : (Array.isArray(raw2?.lugares) ? raw2.lugares : []));
      if (Array.isArray(data)) {
        return data.map(normalizeAgendaLugar);
      }
    } catch {}
    // 3) Fallbacks por tipo
    if (isCentro) {
      // Para centro: POST por lugar -> /Agenda/{centroId}/lugares/{lugarId}/horarios
      const resultados = [];
      for (const d of direcciones) {
        const lugarId = d?.lugarId ?? d?.id ?? null;
        const arr = Array.isArray(d?.horariosAtencion) ? d.horariosAtencion : [];
        if (arr.length === 0) continue;
        const postUrl = `${ENDPOINT}/${id}/lugares/${lugarId != null ? lugarId : ''}/horarios`;
        try {
          // Algunos backends aceptan array, otros objeto simple; probamos array primero
          let r = await WebAPI.Instance().post(postUrl, arr);
          if (!r || !(r.status >= 200 && r.status < 300)) {
            // intentar objeto único si hay uno
            if (arr.length === 1) {
              r = await WebAPI.Instance().post(postUrl, arr[0]);
            }
          }
          resultados.push({ direccion: d?.direccion || '', horariosAtencion: arr });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Fallo POST horarios centro', { postUrl, body: arr, error: e?.response?.data || e?.message || e });
          throw e;
        }
      }
      return resultados.map((r) => normalizeAgendaLugar({ direccion: r.direccion, horariosAtencion: r.horariosAtencion }));
    } else {
      // Profesional: probar /lugares variantes
      let res2 = await WebAPI.Instance().put(`${ENDPOINT}/${id}/lugares`, direcciones);
      let raw3 = res2?.data;
      let data3 = Array.isArray(raw3)
        ? raw3
        : (Array.isArray(raw3?.direcciones) ? raw3.direcciones : (Array.isArray(raw3?.lugares) ? raw3.lugares : []));
      if (Array.isArray(data3)) return data3.map(normalizeAgendaLugar);
      // Con wrapper
      res2 = await WebAPI.Instance().put(`${ENDPOINT}/${id}/lugares`, { lugares: direcciones });
      raw3 = res2?.data;
      data3 = Array.isArray(raw3)
        ? raw3
        : (Array.isArray(raw3?.direcciones) ? raw3.direcciones : (Array.isArray(raw3?.lugares) ? raw3.lugares : []));
      if (Array.isArray(data3)) return data3.map(normalizeAgendaLugar);
    }
    // Último recurso: devolver normalizado local
    return direcciones.map((d) => normalizeAgendaLugar({ direccion: d?.direccion || '', horariosAtencion: d?.horariosAtencion || [] }));
  } catch (err) {
    // Log de diagnóstico para backend/contrato
    // eslint-disable-next-line no-console
    console.error('Fallo updateLugares', { id, isCentro, direcciones, error: err?.response?.data || err?.message || err });
    throw err;
  }
}

// Eliminar un horario específico
export async function deleteHorario(profesionalId, lugarId, horarioId) {
  if (profesionalId == null || lugarId == null || horarioId == null) {
    throw new Error('Parámetros inválidos para eliminar horario');
  }
  const url = `${ENDPOINT}/${profesionalId}/lugares/${lugarId}/horarios/${horarioId}`;
  const res = await WebAPI.Instance().delete(url);
  return (res && res.status >= 200 && res.status < 300);
}


