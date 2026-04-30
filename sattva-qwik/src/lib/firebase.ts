/**
 * Firebase Analytics bootstrap. Browser-only.
 * Forwards events to GA4 via the Firebase SDK so we get a single, unified stream.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported,
  logEvent as fbLogEvent,
  setUserId as fbSetUserId,
  type Analytics,
} from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyA8EGuMtHqSHDwfINuR_mz3b2hwJO2dWGg',
  authDomain: 'devutsav-4e90c.firebaseapp.com',
  projectId: 'devutsav-4e90c',
  storageBucket: 'devutsav-4e90c.firebasestorage.app',
  messagingSenderId: '539076011865',
  appId: '1:539076011865:web:0060ee3ed251cc36038e48',
  measurementId: 'G-WZDTDP7FY3',
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

export function initFirebase(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const supported = await isSupported();
      if (!supported) return null;
      app = getApps()[0] || initializeApp(firebaseConfig);
      analytics = getAnalytics(app);
      return analytics;
    } catch (err) {
      console.warn('[firebase] init failed', err);
      return null;
    }
  })();
  return initPromise;
}

export function logFirebaseEvent(name: string, params?: Record<string, unknown>): void {
  if (!analytics) return;
  try {
    fbLogEvent(analytics, name as string, params as Record<string, any>);
  } catch (err) {
    console.warn('[firebase] logEvent failed', err);
  }
}

export function setFirebaseUserId(id: string): void {
  if (!analytics) return;
  try {
    fbSetUserId(analytics, id);
  } catch {}
}
