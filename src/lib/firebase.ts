import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firebase Admin Configuration
 *
 * Initializes Firebase Admin SDK for server-side operations (API routes).
 * This uses Firebase Admin SDK which requires service account credentials.
 *
 * For client-side Firebase operations, use lib/firebaseClient.ts instead.
 */

// Initialize Firebase Admin (server-side only)
if (!getApps().length) {
  try {
    // Option 1: Using service account key file path
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      });
    }
    // Option 2: Using individual service account credentials from env vars
    else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Firebase private keys have escaped newlines, we need to replace them
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }
    // Option 3: Using only project ID (works in some environments like Cloud Run)
    else if (process.env.FIREBASE_PROJECT_ID) {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      throw new Error(
        "Firebase credentials not found. Please set FIREBASE_PROJECT_ID in your .env.local file."
      );
    }

    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
    throw error;
  }
}

/**
 * Firestore database instance
 * Export this to use throughout your application
 */
export const db = getFirestore();

// Set Firestore settings (optional)
// Set Firestore settings (optional)
try {
  db.settings({
    ignoreUndefinedProperties: true, // Ignore undefined properties (similar to MongoDB behavior)
  });
} catch (error) {
  // Ignore "Firestore has already been initialized" error in development/HMR
}

export default db;
