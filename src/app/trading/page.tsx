"use client";

import { useState } from "react";
import Link from "next/link";

const mockOpenPositions = [
  {
    id: 1,
    side: "LONG" as const,
    entry: 67850,
    size: 0.015,
    unrealizedPnl: 24.3,
  },
  {
    id: 2,
    side: "SHORT" as const,
    entry: 68210,
    size: 0.01,
    unrealizedPnl: -8.7,
  },
];

type ReplayStep = 0 | 1 | 2 | 3;

export default function Page() {
  const totalUnrealized = mockOpenPositions.reduce(
    (sum, p) => sum + p.unrealizedPnl,
    0
  );
  const [replayStep, setReplayStep] = useState<ReplayStep>(0);

  const handleReplay = () => {
    setReplayStep((prev) => ((prev + 1) % 4) as ReplayStep);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
              Trading dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Live BTC/USDT{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-purple-400 bg-clip-text text-transparent">
                strategy view
              </span>
              .
            </h1>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              This page represents the trading screen for the bot. In the full
              version it connects to live data, runs the strategy and updates
              open positions in real time. For the competition demo, we show a
              static layout and example positions.
            </p>
          </div>

          {/* Bot status dashboard */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-xs shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Engine status
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="font-mono text-emerald-300">
                    READY (demo)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Unrealized P/L
                </div>
                <div
                  className={`mt-1 font-mono text-sm ${
                    totalUnrealized >= 0
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}
                >
                  {totalUnrealized >= 0 ? "+" : ""}
                  {totalUnrealized.toFixed(2)} USDT
                </div>
              </div>
            </div>
            <div className="grid gap-3 text-[11px] text-slate-300 sm:grid-cols-3">
              <StatusTile label="Latency target" value="< 1s" />
              <StatusTile label="Risk per trade" value="~1%" />
              <StatusTile label="Max concurrent trades" value="3" />
            </div>
          </div>
        </section>

        {/* Main layout: chart preview + controls + positions */}
        <section className="grid gap-6 lg:grid-cols-[1.7fr,1.3fr]">
          {/* Fake chart / market block */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-mono text-slate-200">
                      BTC/USDT
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      BOT READY
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    TradingView chart + Binance data in full version
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div className="font-mono text-sm text-emerald-300">
                    68,120.50
                  </div>
                  <div>Last price (demo)</div>
                </div>
              </div>

              {/* Fake mini chart */}
              <div className="mb-3 h-44 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 p-2">
                <div className="flex h-full items-end gap-[3px]">
                  {Array.from({ length: 70 }).map((_, i) => {
                    const h = 25 + ((i * 19) % 65);
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

              {/* Strategy tags */}
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                  1m / 5m structure
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                  EMA trend filter
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                  Breakout + pullback logic
                </span>
              </div>
            </div>

            {/* Info block */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                How this page fits in
              </p>
              <p className="mt-2">
                This trading view is the middle of the pipeline:
                <span className="font-semibold text-slate-100">
                  {" "}
                  live data → strategy engine → dashboard → history log.
                </span>
              </p>
              <p className="mt-2">
                In a full run, entries and exits from this screen push trades
                into the Bot History page, where judges can inspect every
                decision line by line.
              </p>
            </div>
          </div>

          {/* Controls + open positions + replay */}
          <div className="space-y-4">
            {/* Bot controls */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-sm font-semibold text-slate-50">
                Bot controls (demo)
              </h2>
              <p className="mt-1 text-[11px] text-slate-400">
                In the final version, these controls toggle the live strategy,
                adjust risk per trade and switch between different sets of
                parameters.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <button
                  className="
                    group relative overflow-hidden rounded-full bg-gradient-to-r 
                    from-purple-500 to-emerald-400 px-6 py-2 font-semibold text-slate-950 
                    shadow-lg shadow-purple-500/30 transition-all duration-300 
                    hover:scale-[1.05] hover:shadow-purple-500/50 active:scale-[0.97]
                  "
                >
                  <span
                    className="
                      absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-purple-500/30 
                      opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl
                    "
                  />
                  <span className="relative z-10">Start bot</span>
                </button>
                <button
                  className="
                    group relative overflow-hidden rounded-full border border-slate-700 
                    px-6 py-2 font-semibold text-slate-100 transition-all duration-300 
                    hover:scale-[1.05] hover:bg-slate-900 hover:border-slate-500 active:scale-[0.97]
                  "
                >
                  <span
                    className="
                      absolute inset-0 bg-gradient-to-r from-purple-500/20 to-emerald-400/20 
                      opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl
                    "
                  />
                  <span className="relative z-10">Stop bot</span>
                </button>
                <span className="rounded-full border border-amber-500/60 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-300">
                  Safe · Simulation only
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-[11px] text-slate-300 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <div className="text-slate-400">Risk per trade</div>
                  <div className="mt-1 font-mono text-sm text-slate-100">
                    1.0%
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <div className="text-slate-400">Max concurrent trades</div>
                  <div className="mt-1 font-mono text-sm text-slate-100">
                    3
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <div className="text-slate-400">Mode</div>
                  <div className="mt-1 font-mono text-sm text-emerald-300">
                    Strategy A (demo)
                  </div>
                </div>
              </div>
            </div>

            {/* Trade replay + open positions */}
            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              {/* Trade replay */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-50">
                    Trade replay (demo)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Step through how a single trade moves from signal → entry →
                    exit.
                  </p>
                </div>
                <button
                  onClick={handleReplay}
                  className="
                    group relative overflow-hidden rounded-full bg-gradient-to-r 
                    from-purple-500 to-emerald-400 px-4 py-1.5 text-[11px] font-semibold 
                    text-slate-950 shadow-md shadow-purple-500/30 transition-all duration-300 
                    hover:scale-[1.05] hover:shadow-purple-500/50 active:scale-[0.97]
                  "
                >
                  <span
                    className="
                      absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-purple-500/30 
                      opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl
                    "
                  />
                  <span className="relative z-10">
                    {replayStep === 0 ? "Play" : "Next step"}
                  </span>
                </button>
              </div>

              <ReplayTimeline step={replayStep} />

              {/* Open positions */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Open positions (demo)</span>
                  <Link
                    href="/history"
                    className="text-[11px] font-medium text-emerald-300 hover:text-emerald-200"
                  >
                    View full trade history →
                  </Link>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        <th className="px-2 py-2 text-left">ID</th>
                        <th className="px-2 py-2 text-left">Side</th>
                        <th className="px-2 py-2 text-left">Entry</th>
                        <th className="px-2 py-2 text-left">Size (BTC)</th>
                        <th className="px-2 py-2 text-left">
                          Unrealized P/L
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockOpenPositions.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-slate-900/70 hover:bg-slate-900/50"
                        >
                          <td className="px-2 py-2 font-mono text-[11px] text-slate-200">
                            {p.id}
                          </td>
                          <td className="px-2 py-2">
                            <span
                              className={`rounded-full px-2 py-[3px] text-[11px] font-semibold ${
                                p.side === "LONG"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-red-500/15 text-red-300"
                              }`}
                            >
                              {p.side}
                            </span>
                          </td>
                          <td className="px-2 py-2 font-mono text-[11px] text-slate-200">
                            {p.entry.toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}{" "}
                            USDT
                          </td>
                          <td className="px-2 py-2 font-mono text-[11px] text-slate-200">
                            {p.size.toFixed(4)}
                          </td>
                          <td
                            className={`px-2 py-2 font-mono text-[11px] ${
                              p.unrealizedPnl >= 0
                                ? "text-emerald-300"
                                : "text-red-300"
                            }`}
                          >
                            {p.unrealizedPnl >= 0 ? "+" : ""}
                            {p.unrealizedPnl.toFixed(2)} USDT
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-3 text-[11px] text-slate-400">
                  In the full implementation, this table is populated from the
                  bot&apos;s internal state. When positions close, they are
                  moved into the Bot History page with final P/L.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs text-slate-100">{value}</div>
    </div>
  );
}

function ReplayTimeline({ step }: { step: ReplayStep }) {
  const stages = [
    {
      title: "Signal detected",
      body: "Strategy sees breakout + trend alignment on BTC/USDT.",
    },
    {
      title: "Entry executed",
      body: "Bot opens a simulated position with fixed 1% risk.",
    },
    {
      title: "Exit logged",
      body: "Take-profit or stop-loss hit, trade sent to history.",
    },
  ];

  return (
    <div className="mt-3 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-300">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
        Replay steps
      </div>
      <ol className="mt-2 space-y-2">
        {stages.map((s, i) => {
          const index = (i + 1) as ReplayStep;
          const active = step >= index;
          return (
            <li key={i} className="flex items-start gap-2">
              <div
                className={`mt-[2px] flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  active
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-700 bg-slate-900 text-slate-400"
                }`}
              >
                {index}
              </div>
              <div>
                <div
                  className={`font-semibold ${
                    active ? "text-slate-50" : "text-slate-300"
                  }`}
                >
                  {s.title}
                </div>
                <div className="text-[11px] text-slate-400">{s.body}</div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-1 text-[10px] text-slate-500">
        Tap &quot;Play&quot; / &quot;Next step&quot; to cycle through the
        stages. In a full system this would animate on top of the live chart.
      </p>
    </div>
  );
}
