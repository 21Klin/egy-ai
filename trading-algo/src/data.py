# src/data.py
import yfinance as yf
import pandas as pd
from typing import Optional

def fetch_history(ticker: str, start: str, end: Optional[str]=None, interval: str="1d") -> pd.DataFrame:
    """
    Fetch OHLCV data using yfinance. Returns DataFrame with columns: Open, High, Low, Close, Volume
    """
    df = yf.download(ticker, start=start, end=end, interval=interval, progress=False)
    # Some tickers return 'Adj Close' — keep Close as adjusted if present
    if "Adj Close" in df.columns:
        df["Close"] = df["Adj Close"]
        df = df.drop(columns=["Adj Close"])
    df = df.dropna()
    return df
