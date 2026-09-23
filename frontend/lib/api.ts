import axios from 'axios';
import { auth } from './firebase';

const ACCESS_TOKEN_KEY = 'capstonex_access_token';

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const apiBaseUrl = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : 'http://localhost:5000/api';

const api = axios.create({
  // Accept either an origin (https://app.example.com) or an API root (.../api).
  // This prevents `/groups` and `/topics` from bypassing the backend's `/api` prefix.
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const localToken = getStoredAccessToken();
  if (localToken) {
    config.headers.Authorization = `Bearer ${localToken}`;
    return config;
  }

  // Ensure Firebase Auth is initialized before checking currentUser on page reload
  if (!auth) return config;
  await auth.authStateReady();
  
  // Always attach the latest Firebase ID token if the user is signed in
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error fetching Firebase token:', error);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const isAuthRequest = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        setStoredAccessToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        setStoredAccessToken(null);
      }
    }

    if (error.response?.status === 401) {
      setStoredAccessToken(null);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Returns the current Firebase ID token for the signed-in user, or null.
 * Used by SettingsModal and other components that need to attach auth headers manually.
 */
export async function getAccessToken(): Promise<string | null> {
  const localToken = getStoredAccessToken();
  if (localToken) return localToken;
  if (!auth) return null;
  await auth.authStateReady();
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch {
      return null;
    }
  }
  return null;
}

export default api;
