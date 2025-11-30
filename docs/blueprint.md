# **App Name**: KraferSim

## Core Features:

- Real-time Candlestick Chart: Display real-time BTC/USDT candlestick data using the TradingView Charting Library, updating every minute from the Binance WebSocket.
- Depth Chart Heatmap: Visualize buy and sell orders using a heatmap, updating in real-time from the Binance depth stream.
- Buy/Sell Control Panel: Enable users to simulate trades with buy and sell buttons, storing the entry price and direction in local state.
- Live P/L Tracking: Calculate and display running profit/loss based on live price data and simulated trade positions.
- Mini Sparkline Chart: Show a small, real-time updating line chart representing short-term price movement.
- Community Sentiment Widget: Display a line chart and gauge showing community sentiment using mock data.
- Local Trade Storage: Persist simulated trades in the local browser state using Zustand.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) to establish a modern and tech-forward feel. The color suggests sophistication and pairs well with data-heavy interfaces.
- Background color: Dark grey (#1E1E1E), providing a high contrast dark theme for comfortable viewing and highlighting data.
- Accent color: Cyan (#4DD0E1) to draw attention to key interactive elements like the Buy/Sell buttons, creating clear visual cues for trading actions.
- Body and headline font: 'Inter' sans-serif for a clean and modern data dashboard, providing excellent readability and a neutral tone. 'Source Code Pro' monospace is recommended for any code snippets
- The TradingView chart occupies the main central area. The Order Book Heatmap resides on the right, aligning with the chart. Mini Price and Buy/Sell are grouped at the top, and Sentiment/Gauge at the bottom.
- Use simple, outline-style icons to represent different functionalities and data points. The icons should maintain a consistent style throughout the interface.
- Subtle transitions on data updates and interactions within the Buy/Sell panel, without being distracting.