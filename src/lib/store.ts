'use client';

import { create } from 'zustand';
import { saveUserTrade } from "@/lib/saveUserTrade";
import { useUserStore } from "@/lib/UserStore";
export type Order = [string, string, string?]; // [price, quantity, cumulative?]

export interface Position {
  entryPrice: number;
  direction: 'buy' | 'sell';
  timestamp: number;
  size?: number;
  leverage?: number;
}

export interface Trade {
  price: number;
  quantity: number;
  time: number;
  isMaker: boolean;
}

export interface BotHistoryEntry {
  id: number;
  time: number;
  side: 'BUY' | 'SELL';
  price: number;
  size: number;
}

export interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isFinal: boolean;
}

// ==== GA CONFIG ====
const GA_CONFIG = {
  POPULATION_SIZE: 50,
  ELITE_COUNT: 4,
  TOURNAMENT_SIZE: 5,
  MUTATION_PROB: 0.25,
  MUTATION_SCALE: 0.15,
  EPISODE_DURATION: 2 * 60 * 1000,
  TRANSACTION_COST: 0.0005,
  SLIPPAGE: 0.0005,
  TRADE_AMOUNT_USD: 100,
};

export class Genotype {
  short_p: number;
  long_p: number;
  entry_thr: number;
  take_profit: number;
  stop_loss: number;
  cooldown: number;

  constructor(
    short_p: number,
    long_p: number,
    entry_thr: number,
    take_profit: number,
    stop_loss: number,
    cooldown: number
  ) {
    this.short_p = short_p;
    this.long_p = long_p;
    this.entry_thr = entry_thr;
    this.take_profit = take_profit;
    this.stop_loss = stop_loss;
    this.cooldown = cooldown;
  }
}

export interface Individual {
  id: number;
  genotype: Genotype;
  fitness: number;
  pnl: number;
  position: 'long' | 'short' | 'flat';
  entryPrice: number;
  cooldownCounter: number;
  trades: number;
}

export interface AutoTraderState {
  gaStatus: 'idle' | 'running';
  generation: number;
  population: Individual[];
  episodeStartTime: number | null;
  priceHistory: { time: number; price: number }[];
}

// ==== APP STATE ====

interface AppState {
  price: number;
  priceChange: 'up' | 'down' | 'same';

  volume24h: number;
  priceChangePercent: number;
  latency: number;

  position: Position | null;
  pnl: number;

  sentiment: number;
  sentimentHistory: number[];

  sparklineData: { time: number; value: number }[];
  depthData: { bids: Order[]; asks: Order[] };
  trades: Trade[];
  botHistory: BotHistoryEntry[];

  usdtBalance: number;
  btcBalance: number;

  klineHistory: Kline[];
  positionSize: number;
  leverage: number;

  autoTrader: AutoTraderState;
}

// ==== ACTIONS ====

interface AppActions {
  setPrice: (price: number) => void;

  setVolume24h: (v: number) => void;
  setPriceChangePercent: (v: number) => void;
  setLatency: (v: number) => void;

  setDepthData: (d: { bids: Order[]; asks: Order[] }) => void;
  setSparklineData: (d: { time: number; value: number }) => void;
  setSentiment: (v: number) => void;
  addTrade: (t: Trade) => void;

  addBotHistoryEntry: (entry: {
    time: number;
    side: 'BUY' | 'SELL';
    price: number;
    size: number;
  }) => void;
  clearBotHistory: () => void;

  enterPosition: (dir: 'buy' | 'sell') => void;
  closePosition: () => void;
  updatePnl: () => void;

  buyBtc: (usdAmount?: number) => void;
  sellBtc: (btcAmount?: number) => void;

  setLeverage: (leverage: number) => void;
  setPositionSize: (size: number) => void;

  simulateGABotTrade: () => void;

  startGA: () => void;
  stopGA: () => void;
  runGABotLogic: () => void;
  initializePopulation: () => void;
  evolveNextGeneration: () => void;

  setInitialKlines: (klines: Kline[]) => void;
  addKline: (k: Kline) => void;
}

// ==== STORE IMPLEMENTATION ====
// ===== GA HELPERS (REQUIRED) =====

function randomGenotype(): Genotype {
  const short_p = Math.floor(Math.random() * 11) + 1; // 1–12
  const long_p = short_p + Math.floor(Math.random() * 110) + 1;

  const entry_thr =
    10 ** (
      Math.log10(1e-5) +
      Math.random() * (Math.log10(0.005) - Math.log10(1e-5))
    );

  const take_profit =
    10 ** (
      Math.log10(1e-4) +
      Math.random() * (Math.log10(0.05) - Math.log10(1e-4))
    );

  const stop_loss = take_profit * (0.5 + Math.random() * 1.5);

  const cooldown = Math.floor(Math.random() * 4);

  return new Genotype(
    short_p,
    long_p,
    entry_thr,
    take_profit,
    stop_loss,
    cooldown
  );
}


export const useStore = create<AppState & AppActions>((set, get) => ({
  price: 0,
  priceChange: 'same',

  volume24h: 0,
  priceChangePercent: 0,
  latency: 0,

  position: null,
  pnl: 0,

  sentiment: 50,
  sentimentHistory: Array(50).fill(50),

  sparklineData: [],
  depthData: { bids: [], asks: [] },
  trades: [],
  botHistory: [],

  usdtBalance: 10000,
  btcBalance: 0,

  klineHistory: [],
  positionSize: 1000,
  leverage: 1,

  autoTrader: {
    gaStatus: 'idle',
    generation: 0,
    population: [],
    episodeStartTime: null,
    priceHistory: [],
  },

  // ==== BASIC LIVE UPDATES ====

  setPrice: (price) => {
    const old = get().price;
    set((state) => ({
      price,
      priceChange: price > old ? 'up' : price < old ? 'down' : 'same',
      autoTrader: {
        ...state.autoTrader,
        priceHistory: [
          ...state.autoTrader.priceHistory,
          { time: Date.now(), price },
        ].slice(-500),
      },
    }));
    get().updatePnl();
    if (get().autoTrader.gaStatus === 'running') get().runGABotLogic();
  },

  setVolume24h: (v) => set({ volume24h: v }),
  setPriceChangePercent: (v) => set({ priceChangePercent: v }),
  setLatency: (v) => set({ latency: v }),

  setDepthData: (d) => set({ depthData: d }),

  setSparklineData: (d) =>
    set((state) => {
      const arr = [...state.sparklineData, d];
      if (arr.length > 100) arr.shift();
      return { sparklineData: arr };
    }),

  setInitialKlines: (kl) => set({ klineHistory: kl }),

  addKline: (k) =>
    set((state) => {
      const hist = [...state.klineHistory];
      const last = hist[hist.length - 1];
      if (last && last.time === k.time) hist[hist.length - 1] = k;
      else hist.push(k);
      if (hist.length > 1000) hist.shift();
      return { klineHistory: hist };
    }),

  setSentiment: (v) =>
    set((state) => {
      const h = [...state.sentimentHistory, v];
      if (h.length > 50) h.shift();
      return { sentiment: v, sentimentHistory: h };
    }),

  addTrade: (trade) =>
    set((state) => {
      const arr = [trade, ...state.trades];
      if (arr.length > 50) arr.pop();
      return { trades: arr };
    }),

  addBotHistoryEntry: (entry) =>
    set((state) => {
      const nextId =
        state.botHistory.length > 0 ? state.botHistory[0].id + 1 : 1;

      const newEntry: BotHistoryEntry = { id: nextId, ...entry };
      const arr = [newEntry, ...state.botHistory];
      if (arr.length > 100) arr.pop();
      return { botHistory: arr };
    }),

  clearBotHistory: () => set({ botHistory: [] }),

  // ==== POSITIONS / TRADING ====

  enterPosition: (direction) => {
    const { price, position, positionSize, leverage, usdtBalance } = get();
    if (price <= 0 || position) return;

    const requested = Math.max(0, positionSize);
    const margin = Math.min(requested, usdtBalance);
    if (margin <= 0) return;

    set({
      position: {
        entryPrice: price,
        direction,
        timestamp: Date.now(),
        size: margin,
        leverage,
      },
      pnl: 0,
    });
  },

  closePosition: () => {
    const { pnl, position } = get();
    if (!position) return;

    set((state) => ({
      position: null,
      pnl: 0,
      usdtBalance: state.usdtBalance + pnl,
    }));
  },

  updatePnl: () => {
    const { position, price } = get();
    if (position && position.size && position.entryPrice > 0) {
      const pnl =
        (price - position.entryPrice) *
        (position.direction === 'buy' ? 1 : -1) *
        (position.size / position.entryPrice) *
        (position.leverage ?? 1);
      set({ pnl });
    }
  },

  buyBtc: (usdAmount = 100) => {
    const { price, usdtBalance } = get();
    if (price > 0 && usdtBalance > 0) {
      const amt = Math.min(usdAmount, usdtBalance);
      const btc = amt / price;
      set((state) => ({
        usdtBalance: state.usdtBalance - amt,
        btcBalance: state.btcBalance + btc,
      }));
       // SAVE TRADE IF USER IS LOGGED IN 12/11/2025
      const uid = useUserStore.getState().user?.uid;
    if (uid) {
      saveUserTrade(uid, {
  tradeType: "manual",
  timestamp: Date.now(),
  side: "BUY",
  price,
  size: btc,
});

    }
    }
  },

  sellBtc: (btcAmount?) => {
    const { price, btcBalance } = get();
    if (price > 0 && btcBalance > 0) {
      const amt = btcAmount ? Math.min(btcAmount, btcBalance) : btcBalance;
      const usd = amt * price;
      set((state) => ({
        usdtBalance: state.usdtBalance + usd,
        btcBalance: state.btcBalance - amt,
      }));
   // SAVE TRADE IF USER IS LOGGED IN 12/11/2025
    const uid = useUserStore.getState().user?.uid;
    if (uid) {
      saveUserTrade(uid, {
  tradeType: "manual",
  timestamp: Date.now(),
  side: "SELL",
  price,
  size: amt,
});

    }
  }
},

  setLeverage: (leverage) => set({ leverage }),
  setPositionSize: (size) =>
    set((state) => ({
      positionSize: Math.min(Math.max(size, 0), state.usdtBalance),
    })),

  // ==== FRONTEND GA BOT ====

  simulateGABotTrade: () => {
  const {
    price,
    usdtBalance,
    btcBalance,
    buyBtc,
    sellBtc,
    addBotHistoryEntry,
  } = get();

  if (price <= 0) return;

  const direction = Math.random() < 0.5 ? "buy" : "sell";
  const tradeUsd = 1 + Math.random() * 199;

  const uid = useUserStore.getState().user?.uid;

  if (direction === "buy") {
    const amt = Math.min(tradeUsd, usdtBalance);
    if (amt > 1) {
      const btc = amt / price;
      buyBtc(amt);

      addBotHistoryEntry({
        time: Date.now(),
        side: "BUY",
        price,
        size: btc,
      });

      if (uid) {
        saveUserTrade(uid, {
  tradeType: "bot",
  timestamp: Date.now(),
  side: "BUY",
  price,
  size: btc,
});

      }
    }
  } else {
    if (btcBalance <= 0) return;
    const desired = tradeUsd / price;
    const btc = Math.min(desired, btcBalance);
    if (btc > 0) {
      sellBtc(btc);

      addBotHistoryEntry({
        time: Date.now(),
        side: "SELL",
        price,
        size: btc,
      });

      if (uid) {
        saveUserTrade(uid, {
  tradeType: "bot",
  timestamp: Date.now(),
  side: "SELL",
  price,
  size: btc,
});

      }
    }
  }
},


  // ==== GA ENGINE ====

  startGA: () => {
    get().initializePopulation();
    set((state) => ({
      autoTrader: {
        ...state.autoTrader,
        gaStatus: 'running',
        episodeStartTime: Date.now(),
      },
    }));
  },

  stopGA: () => {
    set((state) => ({
      autoTrader: {
        ...state.autoTrader,
        gaStatus: 'idle',
        episodeStartTime: null,
        generation: 0,
        population: [],
      },
    }));
  },

  initializePopulation: () => {
    const pop = Array.from(
      { length: GA_CONFIG.POPULATION_SIZE },
      (_, i) => ({
        id: i,
        genotype: randomGenotype(),
        fitness: 0,
        pnl: 0,
        position: 'flat' as const,
        entryPrice: 0,
        cooldownCounter: 0,
        trades: 0,
      })
    );
    set((state) => ({
      autoTrader: { ...state.autoTrader, generation: 1, population: pop },
    }));
  },

  runGABotLogic: () => {
    const { autoTrader, price, buyBtc, sellBtc, addBotHistoryEntry } = get();
    const { episodeStartTime, priceHistory, population } = autoTrader;

    if (!episodeStartTime) return;

    // still running episode
    if (Date.now() - episodeStartTime < GA_CONFIG.EPISODE_DURATION) {
      const updated = population.map((ind) => {
        const g = ind.genotype;
        if (priceHistory.length < g.long_p) return ind;

        const prices = priceHistory.map((p) => p.price);
        const s = prices.slice(-g.short_p);
        const l = prices.slice(-g.long_p);
        const s_ma = s.reduce((a, b) => a + b, 0) / s.length;
        const l_ma = l.reduce((a, b) => a + b, 0) / l.length;

        const signal = (s_ma - l_ma) / (price + 1e-12);

        let { position, entryPrice, pnl, cooldownCounter, trades } = ind;

        if (cooldownCounter > 0) cooldownCounter--;

        if (ind.id === 0) {
          // real trade simulation
          if (position === 'flat' && cooldownCounter === 0) {
            if (signal > g.entry_thr) {
              buyBtc(GA_CONFIG.TRADE_AMOUNT_USD);
              position = 'long';
              entryPrice = price;
            }
          } else if (position === 'long') {
            const ret = (price - entryPrice) / entryPrice;
            if (ret >= g.take_profit || ret <= -g.stop_loss) {
              sellBtc();
              const sizeBtc =
                GA_CONFIG.TRADE_AMOUNT_USD / entryPrice;
              addBotHistoryEntry({
                time: Date.now(),
                side: 'BUY',
                price: entryPrice,
                size: sizeBtc,
              });
              position = 'flat';
              cooldownCounter = g.cooldown;
            }
          }
        } else {
          // simulated mode
          if (position === 'flat' && cooldownCounter === 0) {
            if (signal > g.entry_thr) {
              position = 'long';
              entryPrice = price;
            } else if (signal < -g.entry_thr) {
              position = 'short';
              entryPrice = price;
            }
          }

          if (position !== 'flat') {
            const ret =
              position === 'long'
                ? (price - entryPrice) / entryPrice
                : (entryPrice - price) / entryPrice;

            if (ret >= g.take_profit || ret <= -g.stop_loss) {
              pnl += ret - GA_CONFIG.TRANSACTION_COST;
              position = 'flat';
              cooldownCounter = g.cooldown;
              trades++;
            }
          }
        }

        return {
          ...ind,
          position,
          entryPrice,
          pnl,
          cooldownCounter,
          trades,
        };
      });

      set((state) => ({
        autoTrader: { ...state.autoTrader, population: updated },
      }));
    } else {
      get().evolveNextGeneration();
    }
  },

  evolveNextGeneration: () => {
    set((state) => {
      const price = get().price;

      // finalize fitness
      const final = state.autoTrader.population.map((ind) => {
        let { pnl, position, entryPrice } = ind;
        if (position !== 'flat') {
          const ret =
            position === 'long'
              ? (price - entryPrice) / entryPrice
              : (entryPrice - price) / entryPrice;
          pnl += ret - GA_CONFIG.TRANSACTION_COST;
        }
        return {
          ...ind,
          fitness: pnl,
          pnl: 0,
          position: 'flat',
          trades: 0,
        };
      });

      final.sort((a, b) => b.fitness - a.fitness);

      const next: Individual[] = [];

      // elite
      for (let i = 0; i < GA_CONFIG.ELITE_COUNT; i++) {
        next.push({
          ...final[i],
          id: i,
          pnl: 0,
          position: 'flat',
          trades: 0,
        });
      }

      // genetic crossover
      while (next.length < GA_CONFIG.POPULATION_SIZE) {
        const pick = () => {
          const group = Array.from({ length: GA_CONFIG.TOURNAMENT_SIZE }, () =>
            final[Math.floor(Math.random() * final.length)]
          );
          return group.sort((a, b) => b.fitness - a.fitness)[0];
        };

        const parentA = pick().genotype;
        const parentB = pick().genotype;

        const alpha = Math.random();

        const child = new Genotype(
          Math.round(parentA.short_p * alpha + parentB.short_p * (1 - alpha)),
          Math.round(parentA.long_p * alpha + parentB.long_p * (1 - alpha)),
          parentA.entry_thr * alpha + parentB.entry_thr * (1 - alpha),
          parentA.take_profit * alpha + parentB.take_profit * (1 - alpha),
          parentA.stop_loss * alpha + parentB.stop_loss * (1 - alpha),
          Math.round(
            parentA.cooldown * alpha + parentB.cooldown * (1 - alpha)
          )
        );

        if (child.short_p >= child.long_p) child.long_p = child.short_p + 1;

        next.push({
          id: next.length,
          genotype: child,
          fitness: 0,
          pnl: 0,
          position: 'flat',
          entryPrice: 0,
          cooldownCounter: 0,
          trades: 0,
        });
      }

      return {
        autoTrader: {
          ...state.autoTrader,
          generation: state.autoTrader.generation + 1,
          population: next,
          episodeStartTime: Date.now(),
        },
      };
    });
  },
}));
