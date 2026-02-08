import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/**
 * Firebase Client SDK Configuration
 *
 * Initializes Firebase for client-side (browser) operations.
 * Uses public environment variables (NEXT_PUBLIC_*).
 *
 * For server-side operations (API routes), use lib/firebase.ts instead.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    "Missing Firebase configuration. Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set."
  );
}

// Initialize Firebase (client-side)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export Firebase services for client-side use
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
