import axios from 'axios';

// 🚀 ARQUITECTURA LIMPIA: Cero importaciones de Zustand, Stores o Servicios locales.
// Esto erradica por completo la Dependencia Circular que causa "x is not a function".

const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

export const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api-render/api' : `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

// INTERCEPTOR DE PETICIONES
apiClient.interceptors.request.use((config) => {
    try {
        // Leemos el token directamente del disco (Zustand persist storage)
        // Evitando importar el hook useAuthStore y rompiendo el bucle.
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

    return config;
});

// INTERCEPTOR DE RESPUESTAS
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Manejo de Token Expirado
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });

                // Guardamos los nuevos tokens directamente en el disco
                localStorage.setItem('refresh_token', data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                // Inyectamos el nuevo token en el estado de Zustand manualmente
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
                // Logout forzado sin importar authService
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/acceso';
                return Promise.reject(refreshError);
            }
        }

        // 🛡️ BLINDAJE PARA WORKBOX (Evita el "Cannot read property 'payload'")
        // Devolvemos un Error nativo de JS en lugar del objeto gigante de Axios
        // para que la cola offline de la PWA no se asfixie al parsearlo.
        const safeErrorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error de red clínico';
        const safeError = new Error(safeErrorMessage);
        (safeError as any).status = error.response?.status;

        return Promise.reject(safeError);
    }
);

export default apiClient;