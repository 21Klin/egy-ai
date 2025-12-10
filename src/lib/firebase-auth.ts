// src/lib/firebase-auth.ts
import { firebaseApp } from "./firebase";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";

export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

// Google Login
export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

// Email Signup
export const signupWithEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Email Login
export const loginWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Logout
export const logout = async () => {
  return await signOut(auth);
};

// Listen to auth changes
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
