/**
 * Utilidades para validar coherencia entre prestadores y agendas de turnos
 */

/**
 * Valida si una especialidad pertenece a un prestador
 * @param {Object} prestador - Prestador a validar
 * @param {string} especialidad - Nombre de la especialidad
 * @returns {boolean} True si la especialidad es válida
 */
export const validarEspecialidadPrestador = (prestador, especialidad) => {
  if (!prestador || !especialidad) return false;
  return prestador.especialidades.some(
    esp => esp.nombre.toLowerCase() === especialidad.toLowerCase()
  );
};

/**
 * Valida si un lugar de atención pertenece a un prestador
 * @param {Object} prestador - Prestador a validar
 * @param {string} lugarAtencion - Dirección del lugar de atención
 * @returns {Object|null} Lugar de atención si es válido, null si no
 */
export const validarLugarAtencionPrestador = (prestador, lugarAtencion) => {
  if (!prestador || !lugarAtencion) return null;
  return prestador.lugaresAtencion.find(
    lugar => lugar.direccion.toLowerCase() === lugarAtencion.toLowerCase()
  );
};

/**
 * Convierte hora en formato HH:MM a minutos desde medianoche
 * @param {string} hora - Hora en formato HH:MM
 * @returns {number} Minutos desde medianoche
 */
const horaAMinutos = (hora) => {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
};

/**
 * Valida si un horario de turno está dentro de los horarios de atención
 * @param {Object} lugarAtencion - Lugar de atención del prestador
 * @param {string} dia - Día de la semana
 * @param {string} horaInicio - Hora inicio del turno (HH:MM)
 * @param {string} horaFin - Hora fin del turno (HH:MM)
 * @returns {boolean} True si el horario es válido
 */
export const validarHorarioEnAtencion = (lugarAtencion, dia, horaInicio, horaFin) => {
  if (!lugarAtencion || !dia || !horaInicio || !horaFin) return false;

  const inicioTurno = horaAMinutos(horaInicio);
  const finTurno = horaAMinutos(horaFin);

  // Buscar en los horarios de atención si hay alguno que cubra este día y horario
  return lugarAtencion.horarios.some(horario => {
    // El día debe estar en la lista de días del horario
    if (!horario.dias.includes(dia)) return false;

    const inicioAtencion = horaAMinutos(horario.horaInicio);
    const finAtencion = horaAMinutos(horario.horaFin);

    // El horario del turno debe estar completamente dentro del horario de atención
    return inicioTurno >= inicioAtencion && finTurno <= finAtencion;
  });
};

/**
 * Valida toda una agenda contra un prestador
 * @param {Object} prestador - Prestador a validar
 * @param {Object} agenda - Agenda a validar
 * @returns {Object} { valida: boolean, errores: string[] }
 */
export const validarAgendaCompleta = (prestador, agenda) => {
  const errores = [];

  if (!prestador) {
    errores.push('Prestador no encontrado');
    return { valida: false, errores };
  }

  // Validar especialidad
  if (!validarEspecialidadPrestador(prestador, agenda.especialidad)) {
    errores.push(
      `La especialidad "${agenda.especialidad}" no está registrada para ${prestador.nombreCompleto}`
    );
  }

  // Validar cada dirección
  agenda.direcciones.forEach((dir, index) => {
    const lugarAtencion = validarLugarAtencionPrestador(prestador, dir.lugar);
    
    if (!lugarAtencion) {
      errores.push(
        `La dirección "${dir.lugar}" no está registrada como lugar de atención para ${prestador.nombreCompleto}`
      );
      return;
    }

    // Validar cada horario de esta dirección
    dir.horarios.forEach((horario, hIndex) => {
      const [horaInicio, horaFin] = horario.horario.split('-');
      
      if (!validarHorarioEnAtencion(lugarAtencion, horario.dia, horaInicio, horaFin)) {
        errores.push(
          `El horario "${horario.dia} ${horario.horario}" en "${dir.lugar}" está fuera de los horarios de atención del prestador`
        );
      }
    });
  });

  return {
    valida: errores.length === 0,
    errores
  };
};

/**
 * Obtiene los lugares de atención disponibles para un prestador
 * @param {Object} prestador - Prestador
 * @returns {Array} Array de lugares de atención
 */
export const obtenerLugaresAtencion = (prestador) => {
  if (!prestador || !prestador.lugaresAtencion) return [];
  return prestador.lugaresAtencion.map(lugar => ({
    id: lugar.id,
    direccion: lugar.direccion,
    codigoPostal: lugar.codigoPostal
  }));
};

/**
 * Obtiene los días disponibles para un lugar de atención
 * @param {Object} prestador - Prestador
 * @param {string} lugarAtencion - Dirección del lugar
 * @returns {Array} Array de días disponibles
 */
export const obtenerDiasDisponibles = (prestador, lugarAtencion) => {
  const lugar = validarLugarAtencionPrestador(prestador, lugarAtencion);
  if (!lugar) return [];

  const diasSet = new Set();
  lugar.horarios.forEach(horario => {
    horario.dias.forEach(dia => diasSet.add(dia));
  });

  return Array.from(diasSet);
};

/**
 * Obtiene el rango de horarios válidos para un día en un lugar
 * @param {Object} prestador - Prestador
 * @param {string} lugarAtencion - Dirección del lugar
 * @param {string} dia - Día de la semana
 * @returns {Array} Array de rangos horarios { horaInicio, horaFin }
 */
export const obtenerRangosHorarios = (prestador, lugarAtencion, dia) => {
  const lugar = validarLugarAtencionPrestador(prestador, lugarAtencion);
  if (!lugar || !dia) return [];

  return lugar.horarios
    .filter(horario => horario.dias.includes(dia))
    .map(horario => ({
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin
    }));
};

export default {
  validarEspecialidadPrestador,
  validarLugarAtencionPrestador,
  validarHorarioEnAtencion,
  validarAgendaCompleta,
  obtenerLugaresAtencion,
  obtenerDiasDisponibles,
  obtenerRangosHorarios
};

