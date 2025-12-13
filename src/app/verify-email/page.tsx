"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/lib/firebase-auth";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setMessage("");

    try {
      await resendVerificationEmail(email, password);
      setMessage("Verification email sent again! Please check your inbox.");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

        <h1 className="text-xl font-semibold text-white text-center mb-4">
          Verify Your Email
        </h1>

        <p className="text-slate-300 text-sm text-center mb-4">
          We sent you a verification link. Please check your inbox and click it to activate your account.
        </p>

        {message && (
          <p className="text-emerald-400 text-xs text-center mb-4">{message}</p>
        )}

        {/* RESEND VERIFICATION SECTION */}
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white mb-2 outline-none focus:border-emerald-400"
          placeholder="Email (for resend)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white mb-3 outline-none focus:border-emerald-400"
          placeholder="Password (for resend)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleResend}
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-emerald-400 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
        >
          Resend Email
        </button>

        <button
          onClick={() => (window.location.href = "/login")}
          className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 py-2 text-sm text-white hover:bg-slate-700 transition"
        >
          Go to Login
        </button>

      </div>
    </main>
  );
}
