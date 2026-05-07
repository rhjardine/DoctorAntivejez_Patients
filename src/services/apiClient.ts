import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// URL base de tu backend en Render
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // timeout: 10000, // Opcional: configurar un timeout si lo deseas
});

// Interceptor de Peticiones (Request Interceptor)
apiClient.interceptors.request.use(
    (config) => {
        // Obtener el token directamente del estado de Zustand en cada request
        const token = useAuthStore.getState().token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Respuestas (Response Interceptor)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Si recibimos un 401 (No Autorizado) y no es un intento de login/refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Opcional: Lógica para refrescar el token si tu backend lo soporta
                // const newToken = await refreshTheToken();
                // useAuthStore.getState().setToken(newToken);
                // originalRequest.headers.Authorization = `Bearer ${newToken}`;
                // return apiClient(originalRequest);

                // Si no hay refresh token, o falla, cerramos la sesión por seguridad
                useAuthStore.getState().logout();

            } catch (refreshError) {
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);