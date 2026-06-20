import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { Auth, getAuth } from 'firebase-admin/auth';

// ─── Lazy singleton ───────────────────────────────────────────────────────────
let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getAdminApp(): App {
  if (_app) return _app;

  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  // Vercel stores the key with literal \n — convert to real newlines
  const privateKey = rawKey?.replace(/\\n/g, '\n');

  const hasRealCreds =
    projectId &&
    clientEmail &&
    privateKey &&
    privateKey.includes('-----BEGIN PRIVATE KEY-----');

  if (hasRealCreds) {
    _app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    console.warn('[firebase-admin] Missing credentials — using projectId only.');
    _app = initializeApp({ projectId: projectId ?? 'dummy' });
  }

  return _app;
}

// ─── Exported accessors (no module-level side effects) ───────────────────────
export function getAdminDb(): Firestore {
  if (!_db) {
    getAdminApp();
    _db = getFirestore();
  }
  return _db;
}

export function getAdminAuth(): Auth {
  if (!_auth) {
    getAdminApp();
    _auth = getAuth();
  }
  return _auth;
}

// Convenience aliases kept for backward compat (lazily resolved on first use)
export const adminDb = new Proxy({} as Firestore, {
  get(_t, prop) {
    return (getAdminDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_t, prop) {
    return (getAdminAuth() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
