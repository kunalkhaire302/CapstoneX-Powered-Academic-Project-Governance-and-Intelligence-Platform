import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
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

export default api;
