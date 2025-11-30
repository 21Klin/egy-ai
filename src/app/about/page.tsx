export default function Page() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Heading */}
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
            About the project
          </p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            A low-latency Bitcoin trading bot, built by students, designed for
            judges.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            This project is a student-built Bitcoin trading bot created for a
            10,000€ competition. Instead of hiding everything behind a black
            box, we focused on clear structure: live data, rule-based strategy,
            transparent UI, and a full trade history.
          </p>
        </section>

        {/* Two-column layout */}
        <section className="grid gap-8 md:grid-cols-[1.4fr,1fr]">
          {/* How the bot works */}
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
            <h2 className="text-lg font-semibold text-slate-50">
              How the bot works
            </h2>
            <p className="text-sm text-slate-300">
              Under the hood, the system is split into layers. Each part has a
              clear job so it&apos;s easy to understand, test and explain during
              the competition.
            </p>

            <ol className="space-y-4 text-sm text-slate-200">
              <li className="flex gap-3">
                <div className="mt-[2px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-emerald-300">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-50">
                    Data layer – live BTC/USDT
                  </div>
                  <p className="text-xs text-slate-300">
                    We subscribe to Binance BTC/USDT streams and normalize the
                    data into candles, order book depth and recent trade ticks.
                    This keeps the latency low and the structure clean.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-[2px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-emerald-300">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-50">
                    Strategy layer – simple, explainable rules
                  </div>
                  <p className="text-xs text-slate-300">
                    On top of that state, the bot checks technical conditions:
                    trend (EMAs), structure (breakouts / pullbacks) and basic
                    volatility filters. When rules are met, it opens or closes
                    simulated positions.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-[2px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-emerald-300">
                  3
                </div>
                <div>
                  <div className="font-semibold text-slate-50">
                    Presentation layer – dashboard + history
                  </div>
                  <p className="text-xs text-slate-300">
                    The trading dashboard shows live chart, order book and
                    positions. Every simulated trade is recorded and surfaced on
                    the Bot History page so judges can inspect each decision.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Team + goals */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-sm font-semibold text-slate-50">
                Why we built it
              </h2>
              <p className="mt-2 text-xs text-slate-300">
                Our goal isn&apos;t to promise perfect profits. Our goal is to
                show that we understand how to design a real trading system:
                data, logic, risk and UI all working together in a transparent
                way.
              </p>
              <p className="mt-2 text-xs text-slate-300">
                Everything the bot does can be audited: entries, exits and P/L
                all appear in the history, and the live dashboard visualizes how
                the engine behaves in real time.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-sm font-semibold text-slate-50">
                About our team
              </h2>
              <p className="mt-2 text-xs text-slate-300">
                We are a small group of students. Each member took ownership of
                a different area: live data and latency, strategy logic,
                front-end UI/UX, and documentation.
              </p>
              <p className="mt-2 text-xs text-slate-300">
                This project is more than a school assignment for us. It&apos;s
                a chance to prove ourselves, support our families and show that
                with limited resources we can still build something serious.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
