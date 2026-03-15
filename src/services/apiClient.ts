import axios from 'axios';
import { useProfileStore } from '../store/useProfileStore';
import { logger } from '../utils/logger';
import { tokenStore } from './authService';

// ✅ SECURITY: URL centralizada via variable de entorno
// Fallback hardcoded para garantizar funcionamiento en producción si la env var no está configurada
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api-render/api' : `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor para inyectar el Token en cada llamada médica
apiClient.interceptors.request.use((config) => {
    // Preferencia a memoria (donde ahora vive de forma segura)
    const token = tokenStore.getAccessToken();
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
                const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                // Llamar endpoint de refresh (backend debe implementarlo)
                const { data } = await axios.post(
                    `${originalRequest.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                // Actualizar tokens en memoria y localStorage
                tokenStore.setAccessToken(data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem('refresh_token', data.refreshToken);
                }

                // Reintentar request original
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                logger.audit('token_refreshed');
                return apiClient(originalRequest);

            } catch (refreshError) {
                // NUCLEAR RESET: Limpieza selectiva y segura via authService
                logger.warn('Session expired, forcing logout');
                const { authService } = await import('./authService');
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        logger.error('API request failed', { status: error.response?.status, url: originalRequest?.url });
        return Promise.reject(error);
    }
);

export default apiClient;
