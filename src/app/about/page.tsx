export default function Page() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* Heading */}
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
            About the website
          </p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            A low-latency Bitcoin trading bot, built by students, designed for
            students.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            This project is a student-built Bitcoin trading bot created for a
            competition. Instead of hiding everything behind a black box, we
            focused on clear structure: live data, rule-based strategy,
            transparent UI, and a full trade history.
          </p>
        </section>

        {/* Two-column layout */}
        <section className="grid gap-8 md:grid-cols-[1.4fr,1fr]">

          {/* How the bot works — Genetic Algorithm */}
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
            <h2 className="text-lg font-semibold text-slate-50">How the bot works</h2>

            <p className="text-sm text-slate-300">
              Our system uses a <span className="text-emerald-300 font-semibold">Genetic Algorithm (GA)</span>,
              an optimization method inspired by evolution. Instead of following fixed rules,
              the bot learns from experience, adapts to conditions, and evolves toward smarter decisions.
            </p>

            <ol className="space-y-4 text-sm text-slate-200">
              <li className="flex gap-3">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-emerald-300">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-50">Population of strategies</div>
                  <p className="text-xs text-slate-300">
                    The bot generates multiple strategy variants. Each individual has different
                    parameters: entry timing, risk, exit behavior, and leverage profiles.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-emerald-300">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-50">Fitness evaluation</div>
                  <p className="text-xs text-slate-300">
                    Each strategy is tested on market data. We evaluate profit, drawdown,
                    stability, and consistency. Better-performing strategies score higher.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-emerald-300">
                  3
                </div>
                <div>
                  <div className="font-semibold text-slate-50">Mutation + crossover</div>
                  <p className="text-xs text-slate-300">
                    The top strategies “breed” new ones. Their parameters mix together, and small
                    mutations introduce new behaviors, helping the bot explore new profitable patterns.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-emerald-300">
                  4
                </div>
                <div>
                  <div className="font-semibold text-slate-50">Evolution over time</div>
                  <p className="text-xs text-slate-300">
                    Over many generations, the bot learns what works. The engine evolves,
                    adapts, and improves automatically with each iteration.
                  </p>
                </div>
              </li>
            </ol>
            {/* Extended Bot Engine Details */}
<div className="mt-10 space-y-8">

  {/* FULL PROCESSING PIPELINE */}
  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
    <h3 className="mb-3 text-lg font-semibold text-slate-50">
      Full Processing Pipeline
    </h3>
    <div className="space-y-3 text-sm text-slate-300">

      <div className="flex items-start gap-3">
        <div className="mt-[2px] h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
          1
        </div>
        <p>
          <span className="font-semibold text-slate-200">Live market ticks →</span>  
          WebSocket feed streams every trade and micro-movement from Binance.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <div className="mt-[2px] h-5 w-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
          2
        </div>
        <p>
          <span className="font-semibold text-slate-200">Data preprocessing →</span>  
          Converts ticks into candles, depth snapshots, and volatility readings.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <div className="mt-[2px] h-5 w-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
          3
        </div>
        <p>
          <span className="font-semibold text-slate-200">Strategy engine →</span>  
          The Genetic Algorithm evaluates signals, thresholds, momentum and trend slopes.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <div className="mt-[2px] h-5 w-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
          4
        </div>
        <p>
          <span className="font-semibold text-slate-200">Execution layer →</span>  
          Simulated entries/exits are triggered with controlled risk rules.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <div className="mt-[2px] h-5 w-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs">
          5
        </div>
        <p>
          <span className="font-semibold text-slate-200">Logging →</span>  
          Every action is stored in Bot History for full transparency and review.
        </p>
      </div>

    </div>
  </div>


  {/* ENGINE SPECIFICATIONS */}
  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
    <h3 className="mb-3 text-lg font-semibold text-slate-50">
      Engine Specifications
    </h3>

    <ul className="space-y-2 text-sm text-slate-300">

      <li>
        <span className="text-slate-400">Market Data:</span>{" "}
        Binance BTC/USDT WebSocket feed
      </li>

      <li>
        <span className="text-slate-400">Strategy Model:</span>{" "}
        Genetic Algorithm (GA), evolving every generation
      </li>

      <li>
        <span className="text-slate-400">Population Size:</span>{" "}
        50 individuals per generation
      </li>

      <li>
        <span className="text-slate-400">Evaluation Window:</span>{" "}
        Short & long moving averages, dynamic volatility
      </li>

      <li>
        <span className="text-slate-400">Execution Mode:</span>{" "}
        Simulated spot positions (no real funds)
      </li>

      <li>
        <span className="text-slate-400">Platform Stack:</span>{" "}
        Next.js, Zustand, TradingView, WebSockets
      </li>

    </ul>
  </div>

</div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            {/* Why we built it */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-sm font-semibold text-slate-50">Why we built it</h2>
              <p className="mt-2 text-xs text-slate-300">
                Our goal isn’t to promise perfect profits. Our goal is to show that we understand
                how to design a real trading system: data, logic, risk management, and UI working
                together in a transparent way.
              </p>
              <p className="mt-2 text-xs text-slate-300">
                Every trade is fully visible and logged, enabling proper analysis, learning,
                and honest demonstration of strategy behavior.
              </p>
            </div>

            {/* About the team */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-sm font-semibold text-slate-50">About our team</h2>
              <p className="mt-2 text-xs text-slate-300">
                We’re three young engineers building proprietary trading software from scratch.
                Our skill sets cover modern automated trading: live feeds, strategy logic,
                quantitative design, UX, and software architecture.
              </p>
              <p className="mt-2 text-xs text-slate-300">
                This isn’t a class project — it’s a proving ground. Talent, consistency,
                and curiosity over everything else. No shortcuts. Just real engineering.
              </p>
            </div>

            {/* Mission */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-sm font-semibold text-slate-50">Mission Statement</h2>
              <p className="mt-2 text-xs text-slate-300">
                Our mission is to build transparent, educational, and high-performance
                trading technology that helps students understand real market structure
                through live data and intelligent automation.
              </p>
            </div>

            {/* Values */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-sm font-semibold text-slate-50">Our Values</h2>
              <ul className="mt-2 text-xs text-slate-300 space-y-2">
                <li>• Transparency over hype</li>
                <li>• Learning through real data</li>
                <li>• Engineering before shortcuts</li>
                <li>• Curiosity and experimentation</li>
              </ul>
            </div>

            {/* Vision */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-sm font-semibold text-slate-50">Vision</h2>
              <p className="mt-2 text-xs text-slate-300">
                Our vision is to transform this simulator into a fully autonomous research
                platform where students can test ideas, benchmark algorithms, and explore
                AI-driven trading safely.
              </p>
            </div>

            {/* LinkedIn */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="text-sm font-semibold text-slate-50">LinkedIn Profiles</h2>
              <div className="mt-3 flex flex-col gap-3 text-xs text-slate-300">
                <a href="https://linkedin.com" target="_blank" className="flex items-center justify-center rounded-md bg-slate-800/60 px-4 py-2 text-sm font-medium hover:bg-slate-700/60 transition">LinkedIn – Team Member 1</a>
                <a href="https://linkedin.com" target="_blank" className="flex items-center justify-center rounded-md bg-slate-800/60 px-4 py-2 text-sm font-medium hover:bg-slate-700/60 transition">LinkedIn – Team Member 2</a>
                <a href="https://linkedin.com" target="_blank" className="flex items-center justify-center rounded-md bg-slate-800/60 px-4 py-2 text-sm font-medium hover:bg-slate-700/60 transition">LinkedIn – Team Member 3</a>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
