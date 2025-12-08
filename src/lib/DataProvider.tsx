"use client";

import { useEffect, useRef } from "react";
import { useStore } from "./store";

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const setPrice = useStore((s) => s.setPrice);
  const setDepth = useStore((s) => s.setDepthData);
  const addTrade = useStore((s) => s.addTrade);
  const setVolume24h = useStore((s) => s.setVolume24h);
  const setPriceChangePercent = useStore((s) => s.setPriceChangePercent);
  const setLatency = useStore((s) => s.setLatency);

  const lastPingTime = useRef<number>(Date.now());

  useEffect(() => {
    // --- PRICE + TRADES STREAM ---
    const priceWS = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@trade"
    );

    priceWS.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const price = Number(data.p);
      const quantity = Number(data.q);

      // Update price
      setPrice(price);

      // Update recent trades
      addTrade({
        price,
        quantity,
        time: data.T,
        isMaker: data.m,
      });

      // Latency calc
      const now = Date.now();
      setLatency(now - lastPingTime.current);
      lastPingTime.current = now;
    };

    // --- DEPTH STREAM (ORDERBOOK) ---
    const depthWS = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms"
    );
    depthWS.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setDepth({
        bids: data.bids || [],
        asks: data.asks || [],
      });
    };

    // --- 24H TICKER (VOLUME + CHANGE) ---
    const statsWS = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@ticker"
    );
    statsWS.onmessage = (event) => {
      const d = JSON.parse(event.data);

      setVolume24h(Number(d.v)); // 24h volume
      setPriceChangePercent(Number(d.P)); // 24h % change
    };

    return () => {
      priceWS.close();
      depthWS.close();
      statsWS.close();
    };
  }, []);

  return <>{children}</>;
}
