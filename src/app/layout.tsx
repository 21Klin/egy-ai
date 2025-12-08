import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import DataProvider from "@/lib/DataProvider";








export const metadata: Metadata = {
  title: "Low-Latency Trading Agent",
  description: "Low-Latency Trading Agent Dashboard",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/history", label: "Bot History" },
  { href: "/guide", label: "Guide" }, // ← NEW
  { href: "/contact", label: "Contact Us" }, // ← NEW
];


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* your fonts + TradingView script kept exactly */}
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
        {/* Global nav bar */}
        <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
                <img
               src="/egy-logo.png"
               alt="EGY Logo"
                 className="h-10 w-10 object-contain"/>                
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">
                  Egy-Ai
                </div>
                <div className="text-[11px] text-slate-400">
                  Low-latency BTC/USDT simulator
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
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
      absolute inset-0 rounded-full 
      bg-slate-800/80 
      opacity-0 transition-opacity duration-200 
      group-hover:opacity-100
    "
  ></span>
  <span className="relative z-10">{item.label}</span>
</Link>

              ))}
              <Link
  href="/trading"
  className="
    group relative overflow-hidden rounded-full bg-gradient-to-r 
    from-purple-500 to-emerald-400 px-6 py-2 
    font-semibold text-slate-950 shadow-lg shadow-purple-500/30 
    transition-all duration-300 hover:scale-[1.05] hover:shadow-purple-500/50 
    active:scale-[0.97] text-xs
  "
>
           <span className="
           absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-purple-500/30 
            opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl
          "></span>

           <span className="relative z-10">Launch Trading</span>
          </Link>

            </nav>

            {/* Mobile quick button */}
           <Link
  href="/trading"
  className="
    group relative flex items-center justify-center overflow-hidden 
    rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 
    px-4 py-1.5 text-[11px] font-semibold text-slate-950 
    shadow-md shadow-purple-500/40 
    transition-all duration-300 hover:scale-[1.07] hover:shadow-purple-500/60 
    active:scale-[0.96] sm:hidden
  "
>
  <span
    className="
      absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-purple-500/30 
      opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl
    "
  ></span>
  <span className="relative z-10">Trade</span>
</Link>

          </div>
        </header>

                {/* Page content pushed down under header */}
        <DataProvider>
  <main className="pt-20">
    {children}
  </main>
</DataProvider>
<Toaster />

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-950/95">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-4 text-[11px] text-slate-400 sm:flex-row sm:items-center">
            <div>
              <span className="font-semibold text-slate-200">
                Bitcoin Trading Bot
              </span>{" "}
              <span className="mx-1 text-slate-500">·</span>
              <span>Student low-latency trading project</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span>BTC/USDT · Simulation · No real funds</span>
              <span className="hidden text-slate-600 sm:inline">|</span>
              <span className="text-slate-500">
                Built for a Yahya Kemal College first step competition
              </span>
            </div>
          </div>
        </footer>

        <Toaster />
      </body>
    </html>

  );
}
