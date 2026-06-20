import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Check if Firebase Admin is already initialized to prevent hot-reloading errors in development
if (getApps().length === 0) {
  // Only initialize if environment variables are provided and appear to be genuine
  const hasRealCreds = 
    firebaseAdminConfig.projectId && 
    firebaseAdminConfig.clientEmail && 
    firebaseAdminConfig.privateKey &&
    firebaseAdminConfig.privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
    !firebaseAdminConfig.privateKey.includes("YOUR_PRIVATE_KEY_HERE");

  if (hasRealCreds) {
    try {
      initializeApp({
        credential: cert(firebaseAdminConfig),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (err) {
      console.error("Failed to initialize Firebase Admin with credentials, falling back:", err);
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project-id'
      });
    }
  } else {
    // Fallback for local development if credentials aren't fully configured yet,
    // to prevent app from crashing immediately on startup
    console.warn("Firebase Admin credentials are not fully configured. API routes relying on Admin SDK might fail.");
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project-id'
    });
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();
