import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import DataProvider from "@/lib/DataProvider";
import CookieBanner from "@/components/cookie/CookieBanner";
import NavUserButton from "@/components/NavUserButton";
import "@/styles/animations.css";

export const metadata: Metadata = {
  title: "Low-Latency Trading Agent",
  description: "Low-Latency Trading Agent Dashboard",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/history", label: "Bot History" },
  { href: "/guide", label: "Guide" },
  { href: "/contact", label: "Contact Us" },
  { href: "/terms-of-use", label: "Terms of Use" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Fonts + TradingView */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
        <script
          type="text/javascript"
          src="https://s3.tradingview.com/tv.js"
          async
        ></script>
      </head>

      <body className="font-body antialiased min-h-screen bg-slate-950 text-slate-50">
        {/* NAVBAR */}
        <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/egy-logo.png"
                alt="EGY Logo"
                className="h-10 w-10 object-contain"
              />
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">
                  Egy-Ai
                </div>
                <div className="text-[11px] text-slate-400">
                  Low-latency BTC/USDT simulator
                </div>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden items-center gap-4 text-xs text-slate-300 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    group relative overflow-hidden rounded-full px-3 py-1
                    text-[11px] font-medium text-slate-300
                    transition-all duration-200
                    hover:scale-[1.05] hover:text-white
                  "
                >
                  <span
                    className="
                      absolute inset-0 rounded-full bg-slate-800/80 
                      opacity-0 group-hover:opacity-100 transition-opacity
                    "
                  ></span>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}

              {/* USER BUTTON (login/signup/avatar) */}
              <NavUserButton />

              {/* REMOVE THIS → duplicated Sign Up button */}
              {/* FIXED: Deleted extra Sign Up button */}

              {/* LAUNCH TRADING */}
              <Link
                href="/trading"
                className="
                  group relative overflow-hidden rounded-full bg-gradient-to-r
                  from-purple-500 to-emerald-400 px-6 py-2 font-semibold 
                  text-slate-950 shadow-lg shadow-purple-500/30 
                  transition-all duration-300 hover:scale-[1.05] 
                  hover:shadow-purple-500/50 active:scale-[0.97] text-xs
                "
              >
                <span
                  className="
                    absolute inset-0 bg-gradient-to-r from-emerald-400/30 
                    to-purple-500/30 opacity-0 group-hover:opacity-100 blur-xl 
                    transition-opacity
                  "
                ></span>
                <span className="relative z-10">Launch Trading</span>
              </Link>
            </nav>

            {/* MOBILE BUTTON */}
            <Link
              href="/trading"
              className="
                group relative flex items-center justify-center overflow-hidden
                rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 
                px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md 
                shadow-purple-500/40 transition-all duration-300 hover:scale-[1.07]
                hover:shadow-purple-500/60 active:scale-[0.96] sm:hidden
              "
            >
              <span
                className="
                  absolute inset-0 bg-gradient-to-r from-emerald-400/30 
                  to-purple-500/30 opacity-0 group-hover:opacity-100 blur-xl 
                  transition-opacity
                "
              ></span>
              <span className="relative z-10">Trade</span>
            </Link>

          </div>
        </header>

        {/* CONTENT */}
        <DataProvider>
          <main className="pt-20">
            {children}
          </main>
        </DataProvider>

        {/* FOOTER */}
        <footer className="border-t border-slate-800 bg-slate-950/95">
          <div className="mx-auto max-w-6xl px-4 py-6 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="text-slate-200 font-semibold tracking-tight">
                EGY AI — Low-Latency Trading Engine
              </div>
              <div className="text-slate-500">
                ™ EGY AI is a protected trademark. All rights reserved.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a href="/terms-of-use" className="hover:text-emerald-300 transition-colors">
                Terms of Use
              </a>
              <span className="text-slate-600">│</span>
              <a href="/privacy" className="hover:text-emerald-300 transition-colors">
                Privacy Policy
              </a>
              <span className="text-slate-600">│</span>
              <a href="/contact" className="hover:text-emerald-300 transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800/70 bg-slate-950 text-center py-3 text-[10px] text-slate-600">
            © 2025 EGY AI — All rights reserved. Protected under global copyright law.
          </div>
        </footer>

        <CookieBanner />
        <Toaster />
      </body>
    </html>
  );
}
