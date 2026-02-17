import axios from 'axios';
import { useProfileStore } from '../store/useProfileStore';
import { logger } from '../utils/logger';

// ✅ SECURITY: URL centralizada via variable de entorno
const API_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api-render/api' : `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor para inyectar el Token en cada llamada médica
apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // ✅ SECURITY: Never log request data (may contain PHI)
    logger.audit('api_request', { method: config.method || 'unknown', url: config.url || 'unknown' });
    return config;
});

// Interceptor para manejar expulsión por token expirado
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si es 401 y no hemos intentado refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = sessionStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                // Llamar endpoint de refresh (backend debe implementarlo)
                const { data } = await axios.post(
                    `${originalRequest.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                // Actualizar tokens
                sessionStorage.setItem('auth_token', data.accessToken);
                if (data.refreshToken) {
                    sessionStorage.setItem('refresh_token', data.refreshToken);
                }

                // Reintentar request original
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                logger.audit('token_refreshed');
                return apiClient(originalRequest);

            } catch (refreshError) {
                // NUCLEAR RESET: Limpieza total por seguridad
                logger.warn('Session expired, forcing logout');
                sessionStorage.clear();
                useProfileStore.getState().clearProfileData();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        logger.error('API request failed', { status: error.response?.status, url: originalRequest?.url });
        return Promise.reject(error);
    }
);

export default apiClient;
