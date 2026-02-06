import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api-render/api' : 'https://doctor-antivejez-web.onrender.com/api',
    headers: { 'Content-Type': 'application/json' }
});

import { useProfileStore } from '../store/useProfileStore';

// ...

// Interceptor para inyectar el Token en cada llamada médica
apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('auth_token'); // Switched to sessionStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
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
                const refreshToken = sessionStorage.getItem('refresh_token'); // Switched to sessionStorage
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
                return apiClient(originalRequest);

            } catch (refreshError) {
                // NUCLEAR RESET: Limpieza total por seguridad
                sessionStorage.clear();
                useProfileStore.getState().clearProfileData();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
