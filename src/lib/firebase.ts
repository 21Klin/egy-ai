// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "egyai-89547.firebaseapp.com",
  projectId: "egyai-89547",
  storageBucket: "egyai-89547.firebasestorage.app",
  messagingSenderId: "1036981043732",
  appId: "1:1036981043732:web:acd7eb57cf1e357b9f9d01",
  measurementId: "G-GN2NLT0423",
};

// Initialize Firebase ONCE
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Load analytics only when user accepts cookies
export async function loadAnalytics() {
  if (typeof window === "undefined") return null; // SSR-safe

  const supported = await isSupported();
  return supported ? getAnalytics(firebaseApp) : null;
}
