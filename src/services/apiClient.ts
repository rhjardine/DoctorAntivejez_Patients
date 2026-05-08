import axios from 'axios';
import { logger } from '../utils/logger';

// Garantía de conexión directa a Render
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

export const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api-render/api' : `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor de peticiones
apiClient.interceptors.request.use((config) => {
    // 🚀 CIRUGÍA: Leemos el token directamente del disco duro del navegador.
    // Al no importar "useAuthStore", rompemos el bucle infinito de dependencias.
    try {
        const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        const token = authStorage?.state?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // Ignoramos errores si el almacenamiento está vacío
    }

    logger.audit('api_request', { method: config.method || 'unknown', url: config.url || 'unknown' });
    return config;
});

// Interceptor de respuestas
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post(
                    `${originalRequest.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                localStorage.setItem('refresh_token', data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                logger.warn('Session expired, forcing logout');

                // 🚀 CIRUGÍA: Hacemos el logout manualmente, sin importar "authService".
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/acceso';
                return Promise.reject(refreshError);
            }
        }

        logger.error('API request failed', {
            status: error.response?.status,
            url: originalRequest?.url,
        });

        const standardError = new Error(error.response?.data?.error || 'Error de conexión con el servidor médico.');
        return Promise.reject(standardError);
    }
);

export default apiClient;