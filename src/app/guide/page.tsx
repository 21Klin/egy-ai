export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">Guide</h1>

      <p className="mb-6 text-slate-300">
        Welcome to the EGY-AI Guide. This page will teach you how to use all
        features of the trading simulator, including the order book, charts,
        trading panel, and the Genetic Algorithm bot.
      </p>

      <div className="space-y-6">
        {/* Section 1 */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-xl font-semibold text-white">1. Live Price Feed</h2>
          <p className="mt-2 text-slate-400">
            The BTC/USDT price updates multiple times per second using a
            WebSocket connection. This simulates real-time market conditions and
            powers all charts and trading components.
          </p>
        </section>

        {/* Section 2 */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-xl font-semibold text-white">2. Order Book</h2>
          <p className="mt-2 text-slate-400">
            The order book shows real-time buy (bids) and sell (asks) pressure.
            Green represents buying interest, while red represents selling.
            Depth bars help visualize demand and liquidity.
          </p>
        </section>

        {/* Section 3 */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-xl font-semibold text-white">3. RSI (Relative Strength Index)</h2>
          <p className="mt-2 text-slate-400">
            RSI shows market momentum. Readings above 70 indicate possible
            overbought conditions, while readings below 30 suggest oversold
            conditions. Our platform includes a mini RSI chart for quick analysis.
          </p>
        </section>

        {/* Section 4 */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-xl font-semibold text-white">4. Trading Panel</h2>
          <p className="mt-2 text-slate-400">
            You can place Spot or Leverage trades. The interface tracks your
            USD and BTC balance in real time. Leverage increases position size but
            also risk.
          </p>
        </section>

        {/* Section 5 */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-xl font-semibold text-white">5. Genetic Algorithm Bot</h2>
          <p className="mt-2 text-slate-400">
            The EGY-AI bot uses Genetic Algorithm concepts to learn improved 
            trading behavior. It observes price movement, tests different actions,
            and evolves toward better strategies through simulated generations.
          </p>
        </section>
      </div>
    </div>
  );
}
