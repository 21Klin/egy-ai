# Trading Algorithm - MA Crossover + RSI (Python)

Educational trading algorithm project.

## Features
- Fetch historical data with `yfinance`
- MA crossover strategy with RSI filter
- Vectorized backtest with slippage and commission
- Performance metrics (CAGR, Sharpe, max drawdown)
- Equity curve plotting and trade markers

## Install
```bash
python -m venv venv
source venv/bin/activate       # macOS / Linux
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```
## Run example
```bash
python examples/run_backtest.py
```

## Notes

This is an educational example; not financial advice.

For live trading, integrate with a broker API and add order management, latency handling, risk limits, and paper trading first.
