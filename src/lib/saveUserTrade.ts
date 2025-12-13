// src/lib/saveUserTrade.ts
import { db } from "@/lib/firestore";
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

/**
 * Saves trade into:
 * users/{uid}/trades/{autoId}
 *
 * Keeps only last 100 trades.
 */

export async function saveUserTrade(
  uid: string,
  trade: {
    tradeType: "manual" | "bot";
    side: "BUY" | "SELL";
    price: number;
    size: number;
    timestamp: number;
  }
) {
  try {
    // Always write to /trades/
    const tradesRef = collection(db, "users", uid, "trades");

    // Save new trade
    await addDoc(tradesRef, trade);

    // Keep only last 100 trades
    const all = await getDocs(tradesRef);

    if (all.size > 100) {
      const sorted = all.docs.sort(
        (a, b) => a.data().timestamp - b.data().timestamp
      );

      const extra = sorted.slice(0, all.size - 100);

      for (const docToDelete of extra) {
        await deleteDoc(docToDelete.ref);
      }
    }
  } catch (e) {
    console.error("🔥 Failed saving trade:", e);
  }
}
