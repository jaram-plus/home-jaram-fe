import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth state — single source of truth for the JWT access token and the
 * signed-in user. Persisted to localStorage so a reload keeps the session.
 *
 * The token is read by the axios request interceptor (shared/api/client.js)
 * to set the `Authorization: Bearer` header, and cleared by the response
 * interceptor on a 401 (expired/invalid token).
 *
 *   const token = useAuthStore.getState().accessToken;        // outside React
 *   const user  = useAuthStore((s) => s.user);                // inside React
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (accessToken, user = null) =>
        set({ accessToken, user, isAuthenticated: Boolean(accessToken) }),
      clear: () => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'jaram-auth',
      partialize: (s) => ({ accessToken: s.accessToken, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isAuthenticated = Boolean(state.accessToken);
      },
    },
  ),
);
