# src/strategy.py
import pandas as pd
import numpy as np
from ta.momentum import RSIIndicator

def add_indicators(df: pd.DataFrame, fast: int=20, slow: int=50, rsi_period: int=14) -> pd.DataFrame:
    df = df.copy()
    df["ma_fast"] = df["Close"].rolling(window=fast, min_periods=1).mean()
    df["ma_slow"] = df["Close"].rolling(window=slow, min_periods=1).mean()
    rsi = RSIIndicator(close=df["Close"], window=rsi_period)
    df["rsi"] = rsi.rsi()
    return df

def generate_signals(df: pd.DataFrame,
                     fast: int=20,
                     slow: int=50,
                     rsi_low: float=30,
                     rsi_high: float=70) -> pd.DataFrame:
    """
    Vectorized signal generation:
      - Long when ma_fast crosses above ma_slow AND rsi < rsi_high
      - Exit when ma_fast crosses below ma_slow OR rsi > rsi_high
    Signals:
      1 => long
      0 => flat
    """
    df = add_indicators(df, fast=fast, slow=slow)
    df["ma_diff"] = df["ma_fast"] - df["ma_slow"]
    # sign of diff
    df["ma_sign"] = np.sign(df["ma_diff"])
    df["ma_sign_prev"] = df["ma_sign"].shift(1).fillna(0)

    # cross up = prev <=0 and now >0
    cross_up = (df["ma_sign_prev"] <= 0) & (df["ma_sign"] > 0)
    cross_down = (df["ma_sign_prev"] >= 0) & (df["ma_sign"] < 0)

    # Build entry/exit rules
    df["signal"] = 0
    # Use a simple regime: if fast>slow -> long, else flat, but apply RSI filter to avoid overbought
    df["signal"] = np.where(df["ma_fast"] > df["ma_slow"], 1, 0)

    # optional: force exit when RSI > rsi_high
    df.loc[df["rsi"] > rsi_high, "signal"] = 0
    # optional: avoid entering when RSI < rsi_low? you can keep it as is to favor lower entry price

    # forward-fill positions (we interpret signal as desired position each day)
    df["position"] = df["signal"].shift(1).fillna(0)  # take position at next bar open (simulated)
    return df
