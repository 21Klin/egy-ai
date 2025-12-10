"use client";

import { useState } from "react";
import { loginWithGoogle, loginWithEmail } from "@/lib/firebase-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async () => {
    setError("");
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
      <h1 className="text-3xl font-bold">Login</h1>

      <input
        className="border px-3 py-2 rounded w-64"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border px-3 py-2 rounded w-64"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleEmailLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded w-64"
      >
        Login with Email
      </button>

      <button
        onClick={handleGoogleLogin}
        className="bg-red-600 text-white px-4 py-2 rounded w-64"
      >
        Login with Google
      </button>
    </main>
  );
}
