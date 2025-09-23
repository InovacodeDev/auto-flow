import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { useAuthStore } from "../stores/authStore";

// API Base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance
const axiosClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        const authState = useAuthStore.getState();

        if (authState.tokens?.accessToken) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${authState.tokens.accessToken}`,
            };
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const authState = useAuthStore.getState();

            if (authState.tokens?.refreshToken) {
                try {
                    // Try to refresh the token
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken: authState.tokens.refreshToken,
                    });

                    const { tokens } = response.data;

                    // Update tokens in store
                    authState.setTokens(tokens);

                    // Retry the original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
                    }

                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, logout user
                    authState.logout();
                    return Promise.reject(new Error("Session expired. Please login again."));
                }
            } else {
                // No refresh token, logout user
                authState.logout();
                return Promise.reject(new Error("No refresh token available. Please login again."));
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
