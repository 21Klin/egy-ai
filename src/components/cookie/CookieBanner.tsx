"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setTimeout(() => setVisible(true), 800); // fade-in delay
    }
  }, []);

  const handleAccept = () => {
  localStorage.setItem("cookieConsent", "accepted");
  setVisible(false);

  import("../../lib/firebase").then(({ analytics }) => {
  console.log("Analytics activated:", analytics);
});

};


  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-lg -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-2xl backdrop-blur">
        <h2 className="text-sm font-semibold text-slate-100">
          🍪 Cookie Preferences
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          EGY AI uses essential and analytics cookies to improve performance.
          By accepting, you allow us to enhance your experience and analyze how
          our platform is used. Learn more in our{" "}
          <Link href="/terms-of-use" className="text-emerald-300 underline">
            Terms of Use
          </Link>
          .
        </p>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={handleDecline}
            className="rounded-full border border-slate-600 px-4 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
          >
            Decline
          </button>

          <button
            onClick={handleAccept}
            className="
              rounded-full bg-gradient-to-r 
              from-purple-500 to-emerald-400 
              px-5 py-1.5 text-xs font-semibold text-slate-950 
              shadow-md shadow-purple-500/30 
              transition hover:scale-[1.04]
            "
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
