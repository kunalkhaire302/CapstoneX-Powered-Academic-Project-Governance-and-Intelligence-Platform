import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase safely (prevents Vercel build errors if env vars are missing during SSG)
let app: any;
let auth: any;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
} catch (error) {
  if (typeof window !== 'undefined') {
    console.error('Firebase initialization error on client. Check your environment variables.', error);
    // Let it throw on the client so we get a clear error instead of a broken auth object
    throw new Error('Firebase is not configured properly. Please check your environment variables (.env).');
  } else {
    console.warn('Firebase initialization error (safe to ignore during build):', error);
    auth = {} as any;
  }
}

export { app, auth };
