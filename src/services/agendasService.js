import WebAPI from './config/WebAPI';

/**
 * Servicio para gestionar las agendas de turnos
 * Este servicio maneja todas las operaciones CRUD relacionadas con las agendas
 */

const ENDPOINT = '/agendas'; // Endpoint base para agendas

/**
 * Obtener todas las agendas de turnos
 * @returns {Promise} Promesa con el array de agendas
 */
export const getAll = async () => {
  try {
    const response = await WebAPI.Instance().get(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error al obtener agendas:', error);
    throw error;
  }
};

/**
 * Obtener una agenda por ID
 * @param {number} id - ID de la agenda
 * @returns {Promise} Promesa con la agenda
 */
export const getById = async (id) => {
  try {
    const response = await WebAPI.Instance().get(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener agenda ${id}:`, error);
    throw error;
  }
};

/**
 * Crear una nueva agenda de turnos
 * @param {Object} agenda - Datos de la agenda a crear
 * @returns {Promise} Promesa con la agenda creada
 */
export const create = async (agenda) => {
  try {
    const response = await WebAPI.Instance().post(ENDPOINT, agenda);
    return response.data;
  } catch (error) {
    console.error('Error al crear agenda:', error);
    throw error;
  }
};

/**
 * Actualizar una agenda existente
 * @param {number} id - ID de la agenda
 * @param {Object} agenda - Datos actualizados de la agenda
 * @returns {Promise} Promesa con la agenda actualizada
 */
export const update = async (id, agenda) => {
  try {
    const response = await WebAPI.Instance().put(`${ENDPOINT}/${id}`, agenda);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar agenda ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar una agenda de turnos
 * @param {number} id - ID de la agenda a eliminar
 * @returns {Promise} Promesa vacía
 */
export const remove = async (id) => {
  try {
    const response = await WebAPI.Instance().delete(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar agenda ${id}:`, error);
    throw error;
  }
};

/**
 * Buscar agendas por prestador
 * @param {string} prestadorId - ID del prestador
 * @returns {Promise} Promesa con el array de agendas del prestador
 */
export const getByPrestador = async (prestadorId) => {
  try {
    const response = await WebAPI.Instance().get(`${ENDPOINT}/prestador/${prestadorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener agendas del prestador ${prestadorId}:`, error);
    throw error;
  }
};

/**
 * Buscar agendas por especialidad
 * @param {string} especialidadId - ID de la especialidad
 * @returns {Promise} Promesa con el array de agendas de la especialidad
 */
export const getByEspecialidad = async (especialidadId) => {
  try {
    const response = await WebAPI.Instance().get(`${ENDPOINT}/especialidad/${especialidadId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener agendas de la especialidad ${especialidadId}:`, error);
    throw error;
  }
};

/**
 * Validar disponibilidad de una agenda
 * Verifica que no haya conflictos de horarios para el prestador
 * @param {Object} agenda - Datos de la agenda a validar
 * @returns {Promise} Promesa con el resultado de la validación
 */
export const validarDisponibilidad = async (agenda) => {
  try {
    const response = await WebAPI.Instance().post(`${ENDPOINT}/validar`, agenda);
    return response.data;
  } catch (error) {
    console.error('Error al validar disponibilidad:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de agendas
 * @returns {Promise} Promesa con las estadísticas
 */
export const getEstadisticas = async () => {
  try {
    const response = await WebAPI.Instance().get(`${ENDPOINT}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de agendas:', error);
    throw error;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getByPrestador,
  getByEspecialidad,
  validarDisponibilidad,
  getEstadisticas
};

