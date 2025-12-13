"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUserStore } from "@/lib/UserStore";

export default function NavUserButton() {
  const { user, profile, loading, logout } = useUserStore();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) return null;

  // NOT LOGGED IN
  if (!user || !profile) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="
            group relative overflow-hidden rounded-full bg-gradient-to-r
            from-purple-500 to-emerald-400 px-5 py-1.5 text-xs font-semibold
            text-slate-950 shadow-lg hover:scale-[1.05] transition
          "
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="
            group relative overflow-hidden rounded-full bg-gradient-to-r
            from-emerald-400 to-purple-500 px-5 py-1.5 text-xs font-semibold
            text-slate-950 shadow-lg hover:scale-[1.05] transition
          "
        >
          Sign Up
        </Link>
      </div>
    );
  }

  // LOGGED IN → AVATAR + MENU
  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center justify-center rounded-full
          h-9 w-9 text-[10px] font-bold uppercase
          bg-gradient-to-br from-emerald-400 to-purple-500
          text-slate-950 shadow-lg shadow-purple-500/30
          hover:shadow-purple-500/50 hover:scale-[1.07]
          transition-all duration-300
        "
      >
        {profile.username?.charAt(0)}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="
            absolute right-0 mt-3 w-48 rounded-xl overflow-hidden
            bg-slate-900/90 backdrop-blur-xl border border-slate-700/60
            shadow-xl shadow-black/50 z-50
            animate-fadeSlideIn
          "
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700/50">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-sm font-semibold text-emerald-300">
              {profile.username}
            </p>
          </div>

          {/* Menu Links */}
          <MenuLink href="/profile" label="Dashboard (Private)" />
          <MenuLink href={`/u/${profile.username}`} label="Public Profile" />
          <MenuLink href="/settings" label="Settings" />

          {/* Logout */}
          <button
            onClick={async () => {
              setOpen(false);
              await logout();          // IMPORTANT: await logout
            }}
            className="
              w-full text-left px-4 py-2 text-sm text-red-400
              hover:bg-red-500/10 transition
            "
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// Dropdown link component
function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        block px-4 py-2 text-sm text-slate-300
        hover:bg-slate-700/40 hover:text-white
        transition
      "
    >
      {label}
    </Link>
  );
}
