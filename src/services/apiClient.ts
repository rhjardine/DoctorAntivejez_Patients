import axios from 'axios';
import { tokenStore } from './tokenStore';
import { logger } from '../utils/logger';

const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD && !envUrl) {
    throw new Error('Critical Initialization Error: VITE_API_URL is required in production environment.');
  }
  return envUrl || '';
};

const API_URL = getApiUrl();

export const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api-render/api' : `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

// INTERCEPTOR DE PETICIONES
apiClient.interceptors.request.use((config) => {
    try {
        // ✅ PRIORIDAD 1: Token en memoria (Síncrono, fresco tras el login)
        const memoryToken = tokenStore.getAccessToken();
        if (memoryToken) {
            config.headers.Authorization = `Bearer ${memoryToken}`;
            logger.audit('api_request', { method: config.method || 'unknown', url: config.url || 'unknown' });
            return config;
        }

        // ✅ PRIORIDAD 2: Fallback a disco (para cuando el usuario recarga la página F5)
        const authStorageStr = localStorage.getItem('auth-storage');
        if (authStorageStr) {
            const parsed = JSON.parse(authStorageStr);
            const token = parsed?.state?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (error) {
        console.error("[API Client] Error leyendo storage:", error);
    }

    logger.audit('api_request', { method: config.method || 'unknown', url: config.url || 'unknown' });
    return config;
});

// INTERCEPTOR DE RESPUESTAS
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });

                // Actualizar disco
                localStorage.setItem('refresh_token', data.refreshToken);

                // ✅ Actualizar memoria
                tokenStore.setAccessToken(data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                // Sincronizar Zustand storage por si acaso
                const authStorageStr = localStorage.getItem('auth-storage');
                if (authStorageStr) {
                    const parsed = JSON.parse(authStorageStr);
                    if (parsed.state) {
                        parsed.state.token = data.accessToken;
                        localStorage.setItem('auth-storage', JSON.stringify(parsed));
                    }
                }

                return apiClient(originalRequest);
            } catch (refreshError) {
                logger.warn('Session expired, forcing logout');
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

        // Blindaje Workbox (evita el error 'payload')
        const safeErrorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error de red clínico';
        const safeError = new Error(safeErrorMessage);
        (safeError as any).status = error.response?.status;

        return Promise.reject(safeError);
    }
);

export default apiClient;