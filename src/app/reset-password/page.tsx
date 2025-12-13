"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/firebase-auth";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    setMessage("");
    setError("");

    try {
      await resetPassword(email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

        <h1 className="text-xl font-semibold text-white text-center">
          Reset Your Password
        </h1>

        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 
                       text-sm text-white outline-none focus:border-emerald-400"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {message && (
            <p className="text-emerald-400 text-xs">{message}</p>
          )}

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            onClick={handleReset}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-emerald-400 
                       py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Send Reset Email
          </button>

          <p className="text-center text-xs text-slate-400 mt-3">
            Remembered your password?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
