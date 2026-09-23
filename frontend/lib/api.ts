import axios from 'axios';
import { auth } from './firebase';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const apiBaseUrl = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : 'http://localhost:5000/api';

const api = axios.create({
  // Accept either an origin (https://app.example.com) or an API root (.../api).
  // This prevents `/groups` and `/topics` from bypassing the backend's `/api` prefix.
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
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
  (error) => {
    // If the token is invalid or expired, Firebase will throw, and our backend will return 401.
    // Firebase handles token refreshes automatically. If auth fails completely, we just redirect.
    if (error.response?.status === 401) {
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
