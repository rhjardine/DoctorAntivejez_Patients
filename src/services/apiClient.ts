import axios from 'axios';
import { useProfileStore } from '../store/useProfileStore';
import { logger } from '../utils/logger';
import { cryptoService } from './cryptoService'; // ✅ SECURITY

// ✅ SECURITY: URL centralizada via variable de entorno
// Fallback hardcoded para evitar errores si la env var no está configurada en Render
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api-render/api' : `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor para inyectar el Token en cada llamada médica (Decrypting first)
apiClient.interceptors.request.use(async (config) => {
    const encryptedToken = sessionStorage.getItem('auth_token');
    if (encryptedToken) {
        try {
            // ✅ SECURITY: Decrypt token before use
            const token = await cryptoService.decrypt(encryptedToken);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            logger.error('Failed to decrypt token in interceptor');
        }
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
                const encryptedRefreshToken = sessionStorage.getItem('refresh_token');
                if (!encryptedRefreshToken) throw new Error('No refresh token');

                // Decrypt refresh token
                const refreshToken = await cryptoService.decrypt(encryptedRefreshToken);
                if (!refreshToken) throw new Error('Invalid refresh token');

                // Llamar endpoint de refresh (backend debe implementarlo)
                const { data } = await axios.post(
                    `${originalRequest.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                // ✅ SECURITY: Encrypt new tokens
                const newEncryptedToken = await cryptoService.encrypt(data.accessToken);
                sessionStorage.setItem('auth_token', newEncryptedToken);

                if (data.refreshToken) {
                    const newEncryptedRefreshToken = await cryptoService.encrypt(data.refreshToken);
                    sessionStorage.setItem('refresh_token', newEncryptedRefreshToken);
                }

                // Reintentar request original
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                logger.audit('token_refreshed');
                return apiClient(originalRequest);

            } catch (refreshError) {
                // NUCLEAR RESET: Limpieza total por seguridad
                logger.warn('Session expired, forcing logout');
                sessionStorage.clear();
                localStorage.clear(); // Ensure clean state
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
