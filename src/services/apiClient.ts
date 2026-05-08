import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { logger } from '../utils/logger';

// Garantía de conexión directa a Render
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

export const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api-render/api' : `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor para inyectar el Token (Extraído directamente de Zustand)
apiClient.interceptors.request.use((config) => {
    // ROMPEMOS EL BUCLE: No usamos authService, leemos el estado directamente
    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    logger.audit('api_request', { method: config.method || 'unknown', url: config.url || 'unknown' });
    return config;
});

// Interceptor para manejar tokens expirados
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

                // Actualizamos el token directamente en localStorage y recargamos
                localStorage.setItem('refresh_token', data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                logger.warn('Session expired, forcing logout');

                // ROMPEMOS EL BUCLE: Hacemos logout desde Zustand directamente
                useAuthStore.getState().logout();
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