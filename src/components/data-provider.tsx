'use client';

import { useEffect, type ReactNode } from 'react';
import { useStore } from '@/lib/store';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const BINANCE_HTTP_URL =
  'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=500';

export function DataProvider({ children }: { children: ReactNode }) {
  const {
    setPrice,
    setDepthData,
    setSparklineData,
    setSentiment,
    addTrade,
    setInitialKlines,
    addKline,
  } = useStore();

  useEffect(() => {
    // 1) Seed some recent 1m candles for GA / charts from REST API
    const seedKlines = async () => {
      try {
        const res = await fetch(BINANCE_HTTP_URL);
        if (!res.ok) {
          console.error('Failed to fetch initial klines:', res.status);
          return;
        }

        const data = await res.json();
        // data is an array of arrays from Binance
        const mapped = data.map((k: any) => ({
          time: k[0] / 1000,              // open time (seconds)
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
          isFinal: true,
        }));

        setInitialKlines(mapped);
        // also seed sparkline from these closes
        mapped.forEach((c: any) => {
          setSparklineData({ time: c.time, value: c.close });
        });
      } catch (err) {
        console.error('Error seeding klines from Binance:', err);
      }
    };

    seedKlines();

    // 2) Live Trade Stream (BTCTUSDT trades) → price + recent trades
    const tradeSocket = new WebSocket(`${BINANCE_WS_URL}/btcusdt@trade`);
    tradeSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.p) {
        const price = parseFloat(data.p);
        setPrice(price);
        addTrade({
          price,
          quantity: parseFloat(data.q),
          time: data.T,
          isMaker: data.m,
        });
      }
    };
    tradeSocket.onerror = (error) => {
      console.error('Trade WebSocket Error:', error);
    };

    // 3) Depth / order book
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

    // 4) 1m Kline stream → sparkline + klineHistory for GA
    const klineSocket = new WebSocket(`${BINANCE_WS_URL}/btcusdt@kline_1m`);
    klineSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.k) {
        const k = data.k; // Binance kline object
        const timeSec = k.t / 1000; // open time in seconds
        const close = parseFloat(k.c);

        // Sparkline uses only time + close
        setSparklineData({
          time: timeSec,
          value: close,
        });

        // Full Kline for store.klineHistory (for GA + backend)
        addKline({
          time: timeSec,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close,
          volume: parseFloat(k.v),
          isFinal: k.x, // true when the candle is closed
        });
      }
    };
    klineSocket.onerror = (error) => {
      console.error('Kline WebSocket Error:', error);
    };

    // 5) Mock sentiment (same as before)
    const sentimentInterval = setInterval(() => {
      setSentiment(
        ((Math.sin(Date.now() / 20000) + 1) / 2) * 80 + Math.random() * 20
      );
    }, 2000);

    return () => {
      tradeSocket.close();
      depthSocket.close();
      klineSocket.close();
      clearInterval(sentimentInterval);
    };
  }, [
    setPrice,
    setDepthData,
    setSparklineData,
    setSentiment,
    addTrade,
    setInitialKlines,
    addKline,
  ]);

  return <>{children}</>;
}
