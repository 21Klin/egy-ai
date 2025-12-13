// src/lib/fetchUserTrades.ts
import { db } from "./firestore";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export async function fetchUserTrades(uid: string) {
  // FIXED → REAL PATH WHERE YOUR TRADES ACTUALLY ARE
  const ref = collection(db, "userTrades", uid, "trades");

  const q = query(ref, orderBy("timestamp", "desc"), limit(100));
  const snap = await getDocs(q);

  const trades: any[] = [];
  snap.forEach((doc) => trades.push(doc.data()));

  const manual = trades.filter((t) => t.tradeType === "manual");
  const bot = trades.filter((t) => t.tradeType === "bot");

  const totalTrades = trades.length;

  const bestTrade = trades.length
    ? Math.max(...trades.map((t) => t.size * t.price))
    : 0;

  const worstTrade = trades.length
    ? Math.min(...trades.map((t) => t.size * t.price))
    : 0;

  const winRate =
    trades.length > 0
      ? Math.round(
          (trades.filter((t) => t.side === "SELL").length / trades.length) * 100
        )
      : 0;

  return {
    manual,
    bot,
    stats: {
      totalTrades,
      bestTrade,
      worstTrade,
      winRate,
    },
  };
}
