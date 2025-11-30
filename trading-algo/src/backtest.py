# src/backtest.py
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from typing import Dict
from .utils import compute_perf

def run_backtest(df: pd.DataFrame,
                 initial_capital: float = 10000,
                 position_size: float = 1.0,
                 slippage: float = 0.0,
                 commission: float = 0.0,
                 freq_per_year: int = 252) -> Dict:
    """
    Vectorized backtest:
      - df must contain columns: Open, Close, position (0 or 1) representing desired position at bar open
      - position_size: fraction of equity to risk per trade (here we use fraction of equity to allocate)
      - slippage: proportion of price moved against you at entry (e.g., 0.0005)
      - commission: flat cost per trade in absolute currency
    Returns:
      dict with equity series, trades dataframe, performance stats
    """
    df = df.copy().dropna(subset=["Open", "Close", "position"])
    df["position_prev"] = df["position"].shift(1).fillna(0)
    # trades when position changes
    df["trade"] = df["position"] - df["position_prev"]
    # Simulate fills at next bar open price (we already shifted)
    # entry price = Open * (1 + slippage) if entering long
    df["entry_price"] = df["Open"] * (1 + slippage * np.sign(df["trade"]))
    # For exits, assume filled at Open*(1 - slippage)
    df["exit_price"] = df["Open"] * (1 - slippage * np.sign(df["trade"]))
    # We will calculate P&L using daily returns when in position
    # daily returns (if long) = Close_t / Close_{t-1} - 1  (we'll use Close-to-Close)
    df["close_ret"] = df["Close"].pct_change().fillna(0)

    # compute position exposure (fraction of equity invested)
    df["exposure"] = df["position"] * position_size

    # strategy returns = exposure * market return
    df["strategy_ret"] = df["exposure"] * df["close_ret"]

    # apply commission on trade days (for both entry and exit)
    df["trade_cost"] = 0.0
    trade_idx = df["trade"] != 0
    df.loc[trade_idx, "trade_cost"] = commission / (initial_capital)  # convert to return impact

    # net returns after costs
    df["net_ret"] = df["strategy_ret"] - df["trade_cost"]

    # equity curve
    equity = (1 + df["net_ret"]).cumprod() * initial_capital

    perf = compute_perf(equity, freq_per_year=freq_per_year)

    trades = df.loc[trade_idx, ["trade", "entry_price", "exit_price", "Open", "Close"]].copy()
    return {
        "df": df,
        "equity": equity,
        "perf": perf,
        "trades": trades
    }

def plot_results(equity: pd.Series, df: pd.DataFrame, title: str = "Backtest"):
    plt.figure(figsize=(12,6))
    plt.plot(equity.index, equity.values)
    plt.title(f"{title} - Equity Curve")
    plt.xlabel("Date")
    plt.ylabel("Equity")
    plt.grid(True)
    # mark entry/exit
    trades = df[df["trade"] != 0]
    buys = trades[trades["trade"] > 0]
    sells = trades[trades["trade"] < 0]
    if not buys.empty:
        plt.scatter(buys.index, equity.loc[buys.index], marker="^", label="Entry", s=80)
    if not sells.empty:
        plt.scatter(sells.index, equity.loc[sells.index], marker="v", label="Exit", s=80)
    plt.legend()
    plt.show()
