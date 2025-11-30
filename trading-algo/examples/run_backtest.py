# examples/run_backtest.py
from src.data import fetch_history
from src.strategy import generate_signals
from src.backtest import run_backtest, plot_results
import pandas as pd

def main():
    ticker = "AAPL"
    start = "2018-01-01"
    end = "2024-12-31"
    df = fetch_history(ticker, start=start, end=end, interval="1d")
    signals = generate_signals(df, fast=20, slow=50, rsi_low=30, rsi_high=70)

    results = run_backtest(signals,
                           initial_capital=10000,
                           position_size=1.0,
                           slippage=0.0005,
                           commission=1.0,  # $1 per trade
                           freq_per_year=252)

    equity = results["equity"]
    perf = results["perf"]
    trades = results["trades"]

    print("Performance:")
    for k,v in perf.items():
        print(f"  {k}: {v:.4f}" if isinstance(v, float) else f"  {k}: {v}")

    print("\nNumber of trades:", len(trades))
    plot_results(equity, results["df"], title=f"{ticker} - MA Crossover + RSI")

if __name__ == "__main__":
    main()
