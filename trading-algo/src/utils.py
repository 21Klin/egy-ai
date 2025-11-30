# src/utils.py
import numpy as np
import pandas as pd

def compute_perf(equity: pd.Series, freq_per_year: int = 252):
    """
    Given equity curve (index = date), compute CAGR, annualized volatility, Sharpe (rf=0),
    and max drawdown.
    """
    returns = equity.pct_change().fillna(0)
    total_return = equity.iloc[-1] / equity.iloc[0] - 1.0
    days = (equity.index[-1] - equity.index[0]).days
    years = days / 365.25 if days > 0 else 1/252
    cagr = (equity.iloc[-1] / equity.iloc[0]) ** (1/years) - 1.0
    ann_vol = returns.std() * (freq_per_year ** 0.5)
    sharpe = cagr / ann_vol if ann_vol != 0 else np.nan
    # max drawdown
    roll_max = equity.cummax()
    drawdown = (equity - roll_max) / roll_max
    max_dd = drawdown.min()
    return {
        "total_return": total_return,
        "cagr": cagr,
        "annual_vol": ann_vol,
        "sharpe": sharpe,
        "max_drawdown": max_dd
    }
