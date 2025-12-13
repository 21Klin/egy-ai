// src/lib/listenToUserTrades.ts
import { db } from "./firestore";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export function listenToUserTrades(uid: string, callback: Function) {
  const ref = collection(db, "users", uid, "trades");
  const q = query(ref, orderBy("timestamp", "desc"), limit(100));

  return onSnapshot(q, (snap) => {
    const trades: any[] = [];
    snap.forEach((doc) => trades.push(doc.data()));

    const manual = trades.filter(t => t.tradeType === "manual");
    const bot = trades.filter(t => t.tradeType === "bot");

    const pnlValues = trades.map(t => t.size * t.price);
    const best = pnlValues.length ? Math.max(...pnlValues) : 0;
    const worst = pnlValues.length ? Math.min(...pnlValues) : 0;

    const winRate = trades.length
      ? Math.round(
          (trades.filter(t => t.side === "SELL").length / trades.length) * 100
        )
      : 0;

    callback({
      manual,
      bot,
      stats: {
        totalTrades: trades.length,
        bestTrade: best,
        worstTrade: worst,
        winRate
      }
    });
  });
}
