import WebAPI from './config/WebAPI';
const ENDPOINT = '/Dashboard';

export const dashboardService = {
  getEstadisticas: async () => {
    try {
      const response = await WebAPI.Instance().get(`${ENDPOINT}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas del dashboard');
    }
  },
};