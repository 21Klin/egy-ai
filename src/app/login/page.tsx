"use client";

import { useState, useEffect } from "react";
import { loginWithEmail } from "@/lib/firebase-auth";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

// Google Auth imports
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleEmailLogin = async () => {
    setError("");
    try {
      await loginWithEmail(email, password);
      console.log("Logged in!");
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ---------------------------------------------------
  // GOOGLE LOGIN FUNCTION (Added, does not modify anything else)
  // ---------------------------------------------------
  const loginWithGoogle = async () => {
    setError("");
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      window.location.href = "/"; // same redirect as email login
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      <div
        className={`
          w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl 
          transform transition-all duration-700
          ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        <h1 className="text-xl font-semibold text-white text-center">
          Login to EGY AI
        </h1>

        <div className="mt-5 space-y-4">

          {/* EMAIL */}
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 
                       text-sm text-white outline-none focus:border-emerald-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD + VISIBILITY TOGGLE */}
          <div className="relative">
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 
                         text-sm text-white outline-none focus:border-emerald-400"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* FORGOT PASSWORD */}
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-xs text-emerald-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* ERROR MESSAGE */}
          {error && <p className="text-red-400 text-xs">{error}</p>}

          {/* LOGIN BUTTON */}
          <button
            onClick={handleEmailLogin}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-emerald-400 
                       py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Log In
          </button>
        </div>

        {/* DIVIDER */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs text-slate-400">OR</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* GOOGLE LOGIN BUTTON (Added, matches UI theme) */}
        <button
          onClick={loginWithGoogle}
          className="
            w-full flex items-center justify-center gap-3 
            rounded-lg px-5 py-2 mt-4
            bg-gradient-to-r from-emerald-400 to-purple-500
            text-slate-950 text-sm font-semibold
            shadow-lg shadow-purple-500/30 
            hover:scale-[1.02] transition-all duration-300
          "
        >
          <img src="/google-icon.png" className="h-4 w-4" alt="" />
          Continue with Google
        </button>

        {/* SIGN UP LINK */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-emerald-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
