const mockTrades = [
  {
    id: 1,
    time: "2025-11-29 11:12",
    side: "BUY" as const,
    price: 68000,
    size: 0.015,
    profit: 18.5,
  },
  {
    id: 2,
    time: "2025-11-29 11:35",
    side: "SELL" as const,
    price: 68120,
    size: 0.015,
    profit: 12.1,
  },
  {
    id: 3,
    time: "2025-11-29 12:02",
    side: "SELL" as const,
    price: 67900,
    size: 0.02,
    profit: -10.4,
  },
  {
    id: 4,
    time: "2025-11-29 12:21",
    side: "BUY" as const,
    price: 67940,
    size: 0.018,
    profit: 7.9,
  },
];

export default function Page() {
  const totalProfit = mockTrades.reduce((sum, t) => sum + t.profit, 0);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Heading */}
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
            Bot history
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Every simulated trade,{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-purple-400 bg-clip-text text-transparent">
              fully visible
            </span>
            .
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            This table shows example trades made by the bot: when the trade
            happened, whether it was a BUY or SELL, at what price, the position
            size and the profit or loss. In the full version, the data here is
            filled directly from the bot&apos;s log.
          </p>
        </section>

        {/* Summary strip */}
        <section className="grid gap-4 text-sm text-slate-200 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="text-xs text-slate-400">Total P/L (demo)</div>
            <div
              className={`mt-1 font-mono text-lg ${
                totalProfit >= 0 ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {totalProfit >= 0 ? "+" : ""}
              {totalProfit.toFixed(2)} USDT
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Sum of all demo trades shown below.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="text-xs text-slate-400">Number of trades</div>
            <div className="mt-1 font-mono text-lg text-slate-100">
              {mockTrades.length}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Each row is one complete simulated position.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="text-xs text-slate-400">Purpose</div>
            <div className="mt-1 text-sm text-slate-100">
              Transparency for judges
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Makes it easy to inspect and explain what the bot is doing.
            </p>
          </div>
        </section>

        {/* Table */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span>Demo trade log</span>
            <span>Connected to BTC/USDT strategy in full version</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-950">
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-[0.15em] text-slate-400">
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Side</th>
                  <th className="px-3 py-2 text-left">Price (USDT)</th>
                  <th className="px-3 py-2 text-left">Size (BTC)</th>
                  <th className="px-3 py-2 text-left">Profit (USDT)</th>
                </tr>
              </thead>
              <tbody>
                {mockTrades.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-900/80 hover:bg-slate-900/40"
                  >
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-200">
                      {t.time}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-[3px] text-[11px] font-semibold ${
                          t.side === "BUY"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {t.side}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-200">
                      {t.price.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-200">
                      {t.size.toFixed(4)}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono text-[11px] ${
                        t.profit >= 0 ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {t.profit >= 0 ? "+" : ""}
                      {t.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            In the real trading run, this page is populated directly from the
            bot&apos;s execution log so every entry and exit can be explained
            line by line.
          </p>
        </section>
      </div>
    </div>
  );
}
