import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api-render/api' : 'https://doctor-antivejez-web.onrender.com/api',
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor para inyectar el Token en cada llamada médica
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar expulsión por token expirado
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('rejuvenate_session_v1');
            // Solo redirigir si no estamos ya en login para evitar loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
