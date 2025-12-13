"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firestore";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import {
  signupWithEmail,
  loginWithGoogle,
  sendVerificationEmailToUser
} from "@/lib/firebase-auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [strength, setStrength] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // --- PASSWORD STRENGTH CHECK ---
  useEffect(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;
    setStrength(score);
  }, [password]);

  const handleSignup = async () => {
    setError("");
    setSuccessMessage("");

    if (!username.trim()) return setError("Username is required.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (strength < 2) return setError("Password is too weak.");

    try {
      // Create Firebase Auth user
      const userCredential = await signupWithEmail(email, password);
      const uid = userCredential.user.uid;

      // Send verification email
      await sendVerificationEmailToUser(userCredential.user);

      // Save Firestore profile
      await setDoc(doc(db, "users", uid), {
  uid,
  email,
  username,
  createdAt: Date.now(),

  // DEFAULT PRIVACY SETTINGS
  showBotTrades: true,
  showManualTrades: true,
  showBotStats: true,
  showManualStats: true,
});


      // Public username → uid index
      await setDoc(doc(db, "usernames", username), {
        uid,
        username,
      });

      // Show success message
      setSuccessMessage(
        `Verification link sent to ${email}. Please check your inbox.`
      );

      // Delay redirect so user sees the message
      setTimeout(() => {
        window.location.href = "/verify-email";
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    }
  };

  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500"
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      
      <div
        className={`w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition-all duration-700 ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1 className="text-xl font-semibold text-white text-center">
          Create Your EGY AI Account
        </h1>

        <div className="mt-5 space-y-3">

          {/* USERNAME */}
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* EMAIL */}
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* CONFIRM PASSWORD */}
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* PASSWORD STRENGTH */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                strength > 0 ? strengthColors[strength - 1] : "bg-transparent"
              }`}
              style={{ width: `${(strength / 4) * 100}%` }}
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <p className="text-emerald-400 text-xs mt-1 text-center">
              {successMessage}
            </p>
          )}

          {/* SIGN UP BUTTON */}
          <button
            onClick={handleSignup}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-emerald-400 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Sign Up
          </button>

          {/* GOOGLE SIGNUP */}
          <button
            onClick={loginWithGoogle}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 text-sm text-white hover:bg-slate-700 transition mt-2"
          >
            Continue with Google
          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-xs text-slate-400 mt-3">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
