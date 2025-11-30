'use client';

import { useEffect, type ReactNode } from 'react';
import { useStore } from '@/lib/store';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

export function DataProvider({ children }: { children: ReactNode }) {
  const {
    setPrice,
    setDepthData,
    setSparklineData,
    setSentiment,
    addTrade,
  } = useStore();

  useEffect(() => {
    // Live Price (Trade Stream) & Recent Trades
    const tradeSocket = new WebSocket(`${BINANCE_WS_URL}/btcusdt@trade`);
    tradeSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.p) {
        setPrice(parseFloat(data.p));
        addTrade({
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          time: data.T,
          isMaker: data.m,
        });
      }
    };
    tradeSocket.onerror = (error) => {
      console.error('Trade WebSocket Error:', error);
    };

    // Depth/Order Book Stream
    const depthSocket = new WebSocket(`${BINANCE_WS_URL}/btcusdt@depth`);
    depthSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.b && data.a) {
        setDepthData({ bids: data.b, asks: data.a });
      }
    };
    depthSocket.onerror = (error) => {
      console.error('Depth WebSocket Error:', error);
    };

    // Kline stream for Sparkline
    const klineSocket = new WebSocket(`${BINANCE_WS_URL}/btcusdt@kline_1m`);
    klineSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.k) {
        setSparklineData({
          time: data.k.t / 1000,
          value: parseFloat(data.k.c),
        });
      }
    };
    klineSocket.onerror = (error) => {
      console.error('Kline WebSocket Error:', error);
    };

    // Mock Sentiment Data Generator
    const sentimentInterval = setInterval(() => {
      setSentiment(
        ((Math.sin(Date.now() / 20000) + 1) / 2) * 80 +
          Math.random() * 20
      );
    }, 2000);

    return () => {
      tradeSocket.close();
      depthSocket.close();
      klineSocket.close();
      clearInterval(sentimentInterval);
    };
  }, [setPrice, setDepthData, setSparklineData, setSentiment, addTrade]);

  return <>{children}</>;
}
