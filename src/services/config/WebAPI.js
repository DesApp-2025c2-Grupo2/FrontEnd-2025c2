import axios from 'axios';

class WebAPI {
    constructor() {
        this._axiosInstance = null; // Variable privada para almacenar la instancia de Axios
    }
    Instance() {
        if (!this._axiosInstance) {
            this._axiosInstance = axios.create({
                //baseURL: 'http://10.8.0.1:5000', // URL de API
                baseURL: 'http://localhost:5000', // URL de API 
                timeout: 10000, // 10 segundos
                headers: {
                    'Content-Type': 'application/json',
                    //headers por defecto
                }
            });
        }
        return this._axiosInstance;
    }
}
export default new WebAPI(); // Instancia única de la clase Api (Singleton)
// Ejemplo de uso en BaseService