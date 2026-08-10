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
// 🔐 El access token vive EXCLUSIVAMENTE en memoria (tokenStore). No se lee ni
// se escribe en disco: un XSS que acceda a localStorage no debe poder recuperar
// una sesión clínica activa.
// Tras un F5 la memoria está vacía y la petición sale sin Authorization: el
// interceptor de respuesta la reintenta usando el refresh token. Ese es el flujo
// previsto, no un fallo. Ver ADR-002.
apiClient.interceptors.request.use((config) => {
    const memoryToken = tokenStore.getAccessToken();
    if (memoryToken) {
        config.headers.Authorization = `Bearer ${memoryToken}`;
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

                // ✅ El access token renovado va SOLO a memoria.
                // Antes se escribía también en 'auth-storage' (localStorage), lo que
                // dejaba una sesión clínica activa expuesta a XSS. Ver ADR-002.
                tokenStore.setAccessToken(data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

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