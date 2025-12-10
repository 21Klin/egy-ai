// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "egyai-89547.firebaseapp.com",
  projectId: "egyai-89547",
  storageBucket: "egyai-89547.firebasestorage.app",
  messagingSenderId: "1036981043732",
  appId: "1:1036981043732:web:acd7eb57cf1e357b9f9d01",
  measurementId: "G-GN2NLT0423",
};

// Prevent double initialization
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Load analytics ONLY on client, only when called
export const loadAnalytics = async () => {
  if (typeof window === "undefined") return null;

  const { isSupported } = await import("firebase/analytics");
  const supported = await isSupported();

  if (!supported) return null;

  return getAnalytics(firebaseApp);
};
