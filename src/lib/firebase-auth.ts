// src/lib/firebase-auth.ts

import { firebaseApp } from "./firebase";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User,
} from "firebase/auth";

// Initialize Firebase Auth
export const auth = getAuth(firebaseApp);

// Google Provider
export const googleProvider = new GoogleAuthProvider();

/* --------------------------
   AUTH ACTIONS
--------------------------- */

// Google Login
export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

// Email Signup (returns new user)
export const signupWithEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Email Login (BLOCKS unverified accounts)
export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);

  if (!result.user.emailVerified) {
    await auth.signOut();
    throw new Error("Email not verified. Please check your inbox.");
  }

  return result;
};

// Logout
export const logout = async () => {
  return await signOut(auth);
};

/* --------------------------
   PASSWORD RESET
--------------------------- */

export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

/* --------------------------
   EMAIL VERIFICATION
--------------------------- */

export const sendVerificationEmailToUser = async (user: User) => {
  return await sendEmailVerification(user);
};

// WHEN USER TRIES TO LOGIN UNVERIFIED → Resend link
export const resendVerificationEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);

  if (result.user && !result.user.emailVerified) {
    await sendEmailVerification(result.user);
    await auth.signOut();
    throw new Error("Verification email sent again. Please check your inbox.");
  }

  return result;
};

/* --------------------------
   AUTH STATE SUBSCRIBER
--------------------------- */

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
