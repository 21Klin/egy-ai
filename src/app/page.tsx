"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

type BootStep = 0 | 1 | 2 | 3;

export default function Page() {
  const [bootDone, setBootDone] = useState(false);
  const [bootStep, setBootStep] = useState<BootStep>(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Futuristic loading / boot screen
  useEffect(() => {
    const timeouts: number[] = [];
    timeouts.push(
      window.setTimeout(() => setBootStep(1), 300),
      window.setTimeout(() => setBootStep(2), 800),
      window.setTimeout(() => setBootStep(3), 1300),
      window.setTimeout(() => setBootDone(true), 1800)
    );
    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x, y });
  };

  // Boot overlay
  if (!bootDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
        <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_0_45px_rgba(56,189,248,0.25)]">
          <div className="mb-4 flex items-center gap-2 text-xs text-emerald-300">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="font-mono uppercase tracking-[0.25em]">
              initializing engine
            </span>
          </div>
          <div className="space-y-2 text-[11px] text-slate-300">
            <BootLine active={bootStep >= 1}>
              Establishing low-latency BTC/USDT connection…
            </BootLine>
            <BootLine active={bootStep >= 2}>
              Loading strategy modules (trend • structure • risk)…
            </BootLine>
            <BootLine active={bootStep >= 3}>
              Linking dashboard → bot → history log…
            </BootLine>
          </div>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-900">
            <div className="h-full w-full animate-[ping_1.4s_ease-out_infinite] bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500" />
          </div>
          <p className="mt-3 text-[10px] text-slate-500">
            Demo boot sequence · No real funds · Student project
          </p>
        </div>
      </div>
    );
  }

  const tickerItems = [
    { label: "BTC/USDT", price: "68,120.54", change: "+0.52%" },
    { label: "24h Volume", price: "32,410 BTC", change: "+3.1%" },
    { label: "Latency", price: "< 1s", change: "target" },
    { label: "Mode", price: "Simulation", change: "safe" },
  ];

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-50">
      {/* Animated background glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#a855f722,_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#020617_0%,transparent_20%,transparent_80%,#020617_100%),linear-gradient(to_bottom,#020617_0%,transparent_15%,transparent_85%,#020617_100%)]" />
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 animate-pulse rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 animate-pulse rounded-full bg-purple-500/15 blur-3xl" />

      {/* Ticker strip */}
      <div className="relative border-b border-slate-800/70 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-2 text-[11px] text-slate-300">
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            live status (demo)
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-4">
            {tickerItems.map((item, i) => (
              <div
                key={i}
                className="flex items-baseline gap-2 font-mono text-[11px]"
              >
                <span className="text-slate-400">{item.label}</span>
                <span className="text-slate-100">{item.price}</span>
                <span
                  className={
                    item.change.includes("+") || item.change === "safe"
                      ? "text-emerald-300"
                      : item.change === "target"
                      ? "text-cyan-300"
                      : "text-slate-400"
                  }
                >
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero section with parallax */}
      <div
        className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl flex-col gap-12 px-4 pb-20 pt-8 lg:flex-row lg:items-center lg:pt-10"
        onMouseMove={handleMouseMove}
      >
        {/* LEFT SIDE TEXT */}
        <section className="z-10 flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live BTC/USDT · Simulation · Student Project
          </span>

          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            The next-gen{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Bitcoin Trading AI
            </span>{" "}
            built for speed, clarity & control.
          </h1>

          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            Our bot reads live market data, detects emerging patterns and
            utilizes a genetic algorithm to execute simulated trades with strict risk rules. Everything is
            clear and concise – from the trading screen to the final trade
            history.
          </p>

          {/* Live status module */}
          <div className="grid max-w-xl gap-3 text-[11px] text-slate-200 sm:grid-cols-3">
            <StatusPill
              label="Strategy engine"
              value="ARMED"
              tone="emerald"
            />
            <StatusPill label="Data feed" value="BTC/USDT" tone="cyan" />
            <StatusPill label="" value="SIMULATION" tone="amber" />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/trading"
              className="
                group relative inline-flex items-center justify-center overflow-hidden 
                rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 
                px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-purple-500/30 
                transition-all duration-300 hover:scale-[1.05] hover:shadow-purple-500/50 active:scale-[0.97]
              "
            >
              <span
                className="
                  absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-purple-500/30 
                  opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl
                "
              />
              <span className="relative z-10 flex items-center">
                Launch trading dashboard
                <span className="ml-2 text-xs">▶</span>
              </span>
            </Link>

            <Link
              href="/history"
              className="
                group relative inline-flex items-center justify-center overflow-hidden 
                rounded-full border border-slate-700 
                px-5 py-2 text-sm font-semibold text-slate-100 transition-all duration-300 
                hover:scale-[1.05] hover:border-slate-500 hover:bg-slate-900 active:scale-[0.97]
              "
            >
              <span
                className="
                  absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-purple-500/10 
                  opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl
                "
              />
              <span className="relative z-10">View bot trade history</span>
            </Link>
          </div>

          {/* SMALL STATS */}
          <dl className="mt-4 grid max-w-xl gap-4 text-xs text-slate-300 sm:grid-cols-3 sm:text-sm">
            <div>
              <dt className="text-slate-400">Latency target</dt>
              <dd className="font-mono text-emerald-300">&lt; 1s</dd>
            </div>
            <div>
              <dt className="text-slate-400">Pair</dt>
              <dd className="font-mono text-slate-100">BTC / USDT</dd>
            </div>
            <div>
              <dt className="text-slate-400">Environment</dt>
              <dd className="font-mono text-amber-300">Demo only</dd>
            </div>
          </dl>
        </section>

        {/* RIGHT SIDE PARALLAX DASHBOARD PREVIEW */}
        <section
          className="z-10 flex-1 transition-transform duration-300"
          style={{
            transform: `translate3d(${parallax.x * 18}px, ${
              parallax.y * -18
            }px, 0)`,
          }}
        >
          <div className="relative mx-auto max-w-md">
            {/* Glowing aura */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-purple-500/40 via-emerald-400/40 to-transparent blur-3xl" />

            {/* Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-2xl shadow-purple-900/40 backdrop-blur">
              {/* TOP */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-mono text-slate-200">
                    BTC/USDT
                  </span>
                  <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    STRATEGY ACTIVE
                  </span>
                  <div className="mt-1 text-xs text-slate-400">
                    Binance stream · 1m candles (demo)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-emerald-300">
                    +142.35 USDT
                  </div>
                  <div className="text-[11px] text-slate-400">P/L (demo)</div>
                </div>
              </div>

              {/* CHART */}
              <div className="mb-3 h-36 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 p-2">
                <div className="flex h-full items-end gap-[3px]">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const h = 25 + ((i * 17) % 60);
                    const up = i % 4 !== 0;
                    return (
                      <div
                        key={i}
                        className={`w-[3px] rounded-full ${
                          up ? "bg-emerald-400/80" : "bg-red-400/80"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* MINI PANELS */}
              <div className="grid gap-3 text-[11px] text-slate-200 md:grid-cols-2">
                <MiniOrderBook />
                <MiniTrades />
              </div>

              {/* TAGS */}
              <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                  EMA crossovers
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                  Breakouts & pullbacks
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                  Risk-controlled entries
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION: three pillars with subtle grid background */}
      <section className="relative border-t border-slate-800 bg-slate-950/90">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.8) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <FeatureCard
            title="Live market data"
            body="We use to BTC/USDT streams and compress order book, price and recent trades into a clean readable interface for testing trading strategy."
          />
          <FeatureCard
            title="Rule-based strategy"
            body="Entries and exits are driven by simple, explainable technical rules instead of a black-box model that no one understands."
          />
          <FeatureCard
            title="Full transparency"
            body="Every simulated order ends up in the Bot History page with exact timestamp, side, size, price and P/L."
          />
        </div>
      </section>

      {/* SECTION: pipeline explanation */}
      <section className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr,1fr]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              From live tick → to decision → to history.
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              The whole site is structured to match how a trading engine
              actually works. Investors/traders can follow the flow from the live trading
              screen, to the strategy logic, and down to the final trade.
            
            </p>
            <ol className="mt-6 space-y-3 text-sm text-slate-200">
              <Step
                index={1}
                title="Data layer"
                body="The data-provider (in the full version) listens to WebSocket streams and converts BTC/USDT into candles, order book snapshots and tick data."
              />
              <Step
                index={2}
                title="Strategy layer"
                body="The bot checks trends, volatility and current market structures to decide when to open or close positions."
              />
              <Step
                index={3}
                title="Presentation layer"
                body="The trading dashboard visualizes everything live, and the Bot History page keeps a record of every simulated trade."
              />
            </ol>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              For Those Who Want To Learn 
            </p>
            <p className="mt-2">
              This UI is not just for looks. It&apos;s designed so you can:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>See the live market and how the bot reacts.</li>
              <li>Inspect every trade in the history table.</li>
              <li>
                Understand that the system is split into clear layers instead of
                one big black box.
              </li>
            </ul>
            <p className="mt-3 text-slate-400">
              Our target is not “perfect” trading, but a{" "}
              <span className="font-semibold text-slate-200">
                clean, explainable engine
              </span>{" "}
              that we can keep improving as we learn.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="relative border-t border-slate-800 bg-slate-950/95">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
            The team behind EGY
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            Three students, one trading engine.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Each member focused on a different part of the project so together
            we could build something that feels like a real trading product
            instead of just a school assignment.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <TeamCard
              initial="E"
              role="HFT Interface & UX Systems Engineering"
              body="Architect of the trading experience. Designs ultra-low latency dashboards, data-dense UI components, intuitive user flow logic, and visual optimization for real-time market execution.
Contributed to algorithmic trading logic through execution routing and UI-level signal integration, ensuring strategy decisions reliably translate into real-time actionable orders."
  title="Co-Founder & Chief UX/UI Systems Officer — EGY AI"
            />
              
            <TeamCard
              initial="G"
              role="Quant Strategy & Market Intelligence"
              body="Architects high-conviction trading frameworks, multi-factor entry/exit criteria, volatility models, and capital exposure rules. Designs rule-based risk systems, liquidation protection, and institutional-grade strategy logic inspired by hedge-fund order flow, macroeconomic structure, and real-world market data."
              title="Co-Founder & Chief Economic Strategy Officer — EGY AI"
            />
            <TeamCard
              initial="Y"
              role="Algorithmic Systems & Trading Infrastructure"
              body="Develops automated execution logic, Python-based trading engines, and market data processing pipelines. Designs signal routing, state management, and bot decision systems that bridge real-time price feeds with capital allocation frameworks for consistent, scalable performance."
              title="Co-Founder & Chief Algorithmic Systems Officer — EGY AI"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function BootLine({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-slate-700"
        }`}
      />
      <span
        className={`font-mono ${
          active ? "text-slate-200" : "text-slate-500"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "cyan" | "amber";
}) {
  const color =
    tone === "emerald"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/40"
      : tone === "cyan"
      ? "text-cyan-300 bg-cyan-500/10 border-cyan-500/40"
      : "text-amber-300 bg-amber-500/10 border-amber-500/40";

  return (
    <div className={`rounded-xl border px-3 py-2 ${color}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs">{value}</div>
    </div>
  );
}

function FeatureCard(props: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
      <h3 className="mb-2 text-sm font-semibold text-slate-50">
        {props.title}
      </h3>
      <p className="text-xs text-slate-300">{props.body}</p>
    </div>
  );
}

function Step(props: { index: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <div className="mt-[2px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-emerald-300">
        {props.index}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-50">
          {props.title}
        </div>
        <div className="text-xs text-slate-300">{props.body}</div>
      </div>
    </li>
  );
}

function MiniOrderBook() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-2">
      <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
        <span>Order book</span>
        <span className="text-emerald-300">depth x25</span>
      </div>
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-1">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full bg-red-500/60"
                style={{ width: `${30 + i * 10}%` }}
              />
            </div>
            <span className="w-16 text-right font-mono text-[10px] text-slate-300">
              68,{210 + i * 4}
            </span>
          </div>
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-1">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full bg-emerald-500/60"
                style={{ width: `${40 + i * 12}%` }}
              />
            </div>
            <span className="w-16 text-right font-mono text-[10px] text-slate-300">
              68,{180 - i * 3}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniTrades() {
  const trades = [
    { side: "BUY", pnl: "+4.32" },
    { side: "SELL", pnl: "-1.12" },
    { side: "BUY", pnl: "+0.87" },
    { side: "BUY", pnl: "+2.03" },
    { side: "SELL", pnl: "-0.54" },
  ] as const;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-2">
      <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
        <span>Recent trades</span>
        <span>last 30s</span>
      </div>
      <div className="space-y-1">
        {trades.map((t, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-[10px]"
          >
            <span
              className={`rounded-full px-2 py-[2px] font-semibold ${
                t.side === "BUY"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-red-500/15 text-red-300"
              }`}
            >
              {t.side}
            </span>
            <span className="font-mono text-slate-300">
              68,{195 + i * 2}
            </span>
            <span
              className={`font-mono ${
                t.pnl.startsWith("+")
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {t.pnl} USDT
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamCard({
  initial,
  role,
  body,
  title,
}: {
  initial: string;
  role: string;
  body: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-emerald-400 text-sm font-bold text-slate-950 shadow-lg shadow-purple-500/40">
          {initial}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-50">{role}</div>
          <div className="text-[11px] text-slate-400">{title}</div>
          
        </div>
      </div>
      <p className="text-xs text-slate-300">{body}</p>
    </div>
  );
}
