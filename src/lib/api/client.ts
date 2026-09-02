import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { store } from "@/store";
import { clearSession } from "@/store/slices/authSlice";
import type { ApiResponse } from "@/types/domain";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8090/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

// Request interceptor: attach auth token & client identifier
apiClient.interceptors.request.use(
  (config) => {
    config.headers["X-Client"] = "naik-kelas-web";

    // Read access token from Redux store
    try {
      const state = store.getState();
      const token = state.auth.accessToken;
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Store not initialized yet or running outside React/Redux context
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle session expiration (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearSession());

      // Redirect to login if in browser and not already on auth page
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/auth/")) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// Typed helper functions
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<ApiResponse<T>> = await apiClient.get(url, config);
  return response.data.data;
}

export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(url, data, config);
  return response.data.data;
}

export async function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<ApiResponse<T>> = await apiClient.put(url, data, config);
  return response.data.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<ApiResponse<T>> = await apiClient.delete(url, config);
  return response.data.data;
}

// Aliases for seamless backward compatibility
export const api = apiClient;
export default apiClient;

