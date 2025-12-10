// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "egyai-89547.firebaseapp.com",
  projectId: "egyai-89547",
  storageBucket: "egyai-89547.firebasestorage.app",
  messagingSenderId: "1036981043732",
  appId: "1:1036981043732:web:acd7eb57cf1e357b9f9d01",
  measurementId: "G-GN2NLT0423",
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const analytics =
  typeof window !== "undefined"
    ? await isSupported().then((supported) =>
        supported ? getAnalytics(firebaseApp) : null
      )
    : null;
