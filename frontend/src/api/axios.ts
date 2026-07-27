import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple infinite loops on refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request Interceptor: Attach JWT
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and attempt refresh, handle 403 globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Ensure we don't intercept /auth routes directly to avoid loops
        if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        // Global 403 handler — user is authenticated but not authorized
        if (error.response?.status === 403) {
            const message = error.response?.data?.message || 'You do not have permission to perform this action.';
            // Use a non-blocking notification pattern
            console.error('[WorkHub] Access denied:', message);
            if (typeof window !== 'undefined') {
                // Defer to avoid blocking the interceptor chain
                setTimeout(() => alert(`Access Denied: ${message}`), 0);
            }
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return apiClient(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                isRefreshing = false;
                // No refresh token, trigger a logout/redirect to login natively
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
                const { accessToken, refreshToken: newRefresh } = response.data;
                
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefresh);
                
                apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
                
                processQueue(null, accessToken);
                
                return apiClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                // Hard reset if refresh fails
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
