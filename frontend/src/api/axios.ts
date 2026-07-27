import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });
                    
                    const { accessToken, refreshToken: newRefreshToken } = res.data;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Refresh token is invalid/expired
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login'; // Or handle via React Router state
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);
