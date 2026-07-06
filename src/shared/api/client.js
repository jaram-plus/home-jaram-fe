import axios from 'axios';
import { useAuthStore } from '@/shared/auth/auth.store';
import { API_BASE_URL } from '@/shared/config/runtime';

export { API_BASE_URL };

/**
 * Shared axios instance for the Spring backend.
 *
 * - Request interceptor attaches the JWT (`Authorization: Bearer <token>`)
 *   read from the auth store, when present.
 * - Response interceptor clears the session on a 401 *while a token was set*
 *   (expired/invalid token) — a 401 during login carries no token, so the
 *   sign-in flow is unaffected.
 *
 * Base URL is resolved by `@/shared/config/runtime` — runtime config.js first
 * (Docker), then `VITE_API_BASE_URL` (local dev), then localhost:8080.
 */

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && useAuthStore.getState().accessToken) {
      useAuthStore.getState().clear();
    }
    return Promise.reject(error);
  },
);
