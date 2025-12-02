"use client";

import { useStore } from "@/lib/store";

export default function Page() {
  const botHistory = useStore((state) => state.botHistory);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Heading */}
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
            Bot history
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Every live trade,{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-purple-400 bg-clip-text text-transparent">
              fully visible
            </span>
            .
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            This table shows the trades made by the GA bot: when the trade
            happened, whether it was a BUY or SELL, at what price, and the
            approximate position size in BTC.
          </p>
        </section>

        {/* Summary strip */}
        <section className="grid gap-4 text-sm text-slate-200 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="text-xs text-slate-400">Number of trades</div>
            <div className="mt-1 font-mono text-lg text-slate-100">
              {botHistory.length}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Each row below is one completed bot action.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="text-xs text-slate-400">Most recent trade</div>
            <div className="mt-1 text-sm text-slate-100">
              {botHistory.length === 0
                ? "None yet"
                : new Date(botHistory[0].time).toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Latest entry in the current session.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="text-xs text-slate-400">Status</div>
            <div className="mt-1 text-sm text-slate-100">
              Live session telemetry
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Data resets when the page or app is refreshed.
            </p>
          </div>
        </section>

        {/* Table */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span>Live bot trade log</span>
            <span>Connected to GA strategy on BTC/USDT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-950">
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-[0.15em] text-slate-400">
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Side</th>
                  <th className="px-3 py-2 text-left">Entry price (USDT)</th>
                  <th className="px-3 py-2 text-left">Size (BTC)</th>
                </tr>
              </thead>
              <tbody>
                {botHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-xs text-slate-500"
                    >
                      No bot trades yet. Start the GA bot on the Trading page
                      and let it close at least one position.
                    </td>
                  </tr>
                ) : (
                  botHistory.map((trade) => (
                    <tr
                      key={trade.id}
                      className="border-b border-slate-900/80 bg-slate-950/40 last:border-0 hover:bg-slate-900/60"
                    >
                      <td className="px-3 py-2 font-mono text-[11px] sm:text-xs">
                        {new Date(trade.time).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            trade.side === "BUY"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          {trade.side}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {trade.price.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {trade.size.toFixed(5)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            This page is powered by the bot&apos;s own execution log, so every
            entry can be inspected line by line. Profit calculations are handled
            elsewhere in the app.
          </p>
        </section>
      </div>
    </div>
  );
}
