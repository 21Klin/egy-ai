'use client';

import { create } from 'zustand';

export type Order = [string, string, string?]; // [price, quantity, cumulative?]

export interface Position {
  entryPrice: number;
  direction: 'buy' | 'sell';
  timestamp: number;
  size?: number; // margin used for leveraged positions
  leverage?: number; // leverage used
}

export interface Trade {
  price: number;
  quantity: number;
  time: number;
  isMaker: boolean; // true if buyer is maker
}

export interface BotHistoryEntry {
  id: number;
  time: number;
  side: 'BUY' | 'SELL';
  price: number; // entry/execute price
  size: number; // size in BTC
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

// ---------- Genetic Algorithm config (for the smart GA bot) ----------
const GA_CONFIG = {
  POPULATION_SIZE: 50,
  ELITE_COUNT: 4,
  TOURNAMENT_SIZE: 5,
  MUTATION_PROB: 0.25,
  MUTATION_SCALE: 0.15,
  EPISODE_DURATION: 2 * 60 * 1000, // 2 minutes
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

// ---------- GA helpers ----------

function randomGenotype(): Genotype {
  const short_p = Math.floor(Math.random() * 11) + 1; // 1–12
  const long_p = short_p + Math.floor(Math.random() * 110) + 1;
  const entry_thr =
    10 **
    (Math.log10(1e-5) +
      Math.random() * (Math.log10(0.005) - Math.log10(1e-5)));
  const take_profit =
    10 **
    (Math.log10(1e-4) +
      Math.random() * (Math.log10(0.05) - Math.log10(1e-4)));
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

function createIndividual(genotype: Genotype, id: number): Individual {
  return {
    id,
    genotype,
    fitness: 0,
    pnl: 0,
    position: 'flat',
    entryPrice: 0,
    cooldownCounter: 0,
    trades: 0,
  };
}

// ---------- Global app state ----------

interface AppState {
  price: number;
  priceChange: 'up' | 'down' | 'same';
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

  // extras from friend
  klineHistory: Kline[];
  positionSize: number;
  leverage: number;

  autoTrader: AutoTraderState;
}

interface AppActions {
  setPrice: (price: number) => void;
  setDepthData: (data: { bids: Order[]; asks: Order[] }) => void;
  setSparklineData: (data: { time: number; value: number }) => void;
  setSentiment: (value: number) => void;
  addTrade: (trade: Trade) => void;

  addBotHistoryEntry: (entry: {
    time: number;
    side: 'BUY' | 'SELL';
    price: number;
    size: number;
  }) => void;
  clearBotHistory: () => void;

  enterPosition: (direction: 'buy' | 'sell') => void;
  closePosition: () => void;
  updatePnl: () => void;

  buyBtc: (usdAmount?: number) => void;
  sellBtc: (btcAmount?: number) => void;

  // leverage controls
  setLeverage: (leverage: number) => void;
  setPositionSize: (size: number) => void;

  // GA bot simulator (frontend only)
  simulateGABotTrade: () => void;

  // big GA autotrader
  startGA: () => void;
  stopGA: () => void;
  runGABotLogic: () => void;
  initializePopulation: () => void;
  evolveNextGeneration: () => void;

  // kline management (for later backend GA integration)
  setInitialKlines: (klines: Kline[]) => void;
  addKline: (kline: Kline) => void;
}

// ---------- Store implementation ----------

export const useStore = create<AppState & AppActions>((set, get) => ({
  price: 0,
  priceChange: 'same',
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
  positionSize: 1000, // default margin per leveraged trade
  leverage: 1,

  autoTrader: {
    gaStatus: 'idle',
    generation: 0,
    population: [],
    episodeStartTime: null,
    priceHistory: [],
  },

  // --------- basic market data updates ---------

  setPrice: (price) => {
    const oldPrice = get().price;
    set((state) => ({
      price,
      priceChange:
        price > oldPrice ? 'up' : price < oldPrice ? 'down' : 'same',
      autoTrader: {
        ...state.autoTrader,
        priceHistory: [
          ...state.autoTrader.priceHistory,
          { time: Date.now(), price },
        ].slice(-500),
      },
    }));
    get().updatePnl();
    if (get().autoTrader.gaStatus === 'running') {
      get().runGABotLogic();
    }
  },

  setDepthData: (data) => set({ depthData: data }),

  setSparklineData: (data) => {
    set((state) => {
      const newData = [...state.sparklineData, data];
      if (newData.length > 100) newData.shift();
      return { sparklineData: newData };
    });
  },

  setInitialKlines: (klines: Kline[]) => {
    set({ klineHistory: klines });
  },

  addKline: (kline: Kline) => {
    set((state) => {
      const history = [...state.klineHistory];
      const last = history[history.length - 1];
      if (last && last.time === kline.time) {
        history[history.length - 1] = kline;
      } else {
        history.push(kline);
      }
      if (history.length > 1000) history.shift();
      return { klineHistory: history };
    });
  },

  setSentiment: (value) => {
    set((state) => {
      const newHistory = [...state.sentimentHistory, value];
      if (newHistory.length > 50) newHistory.shift();
      return { sentiment: value, sentimentHistory: newHistory };
    });
  },

  addTrade: (trade) => {
    set((state) => {
      const newTrades = [trade, ...state.trades];
      if (newTrades.length > 50) newTrades.pop();
      return { trades: newTrades };
    });
  },

  addBotHistoryEntry: (entry) =>
    set((state) => {
      const nextId =
        state.botHistory.length > 0 ? state.botHistory[0].id + 1 : 1;

      const newEntry: BotHistoryEntry = {
        id: nextId,
        ...entry,
      };

      const history = [newEntry, ...state.botHistory];
      if (history.length > 100) history.pop(); // keep last 100 trades

      return { botHistory: history };
    }),

  clearBotHistory: () => set({ botHistory: [] }),

  // --------- spot + leverage trading ---------

  // LEVERAGE: open a virtual position, margin clamped to USDT balance
  enterPosition: (direction) => {
    const { price, position, positionSize, leverage, usdtBalance } = get();

    if (price <= 0 || position) return;

    const requested = positionSize ?? 0;
    const maxMargin = Math.max(0, usdtBalance);
    const margin = Math.min(Math.max(requested, 0), maxMargin);

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
      const amountToBuy = Math.min(usdAmount, usdtBalance);
      const btcAmount = amountToBuy / price;
      set((state) => ({
        usdtBalance: state.usdtBalance - amountToBuy,
        btcBalance: state.btcBalance + btcAmount,
      }));
    }
  },

  sellBtc: (btcAmountToSell) => {
    const { price, btcBalance } = get();
    if (price > 0 && btcBalance > 0) {
      const amountToSell = btcAmountToSell
        ? Math.min(btcAmountToSell, btcBalance)
        : btcBalance;
      if (btcBalance >= amountToSell) {
        const usdtAmount = amountToSell * price;
        set((state) => ({
          usdtBalance: state.usdtBalance + usdtAmount,
          btcBalance: state.btcBalance - amountToSell,
        }));
      }
    }
  },

  setLeverage: (leverage) => set({ leverage }),

  setPositionSize: (size) =>
    set((state) => {
      const clean = Number.isFinite(size) ? Math.max(0, size) : 0;
      const max = Math.max(0, state.usdtBalance);
      return { positionSize: Math.min(clean, max) };
    }),

  // --------- simple GA bot simulator (frontend-only) ---------

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

    const direction = Math.random() < 0.5 ? 'buy' : 'sell';
    const tradeUsd = 1 + Math.random() * 199;

    let executed = false;
    let executedBtcSize = 0;

    if (direction === 'buy') {
      const usdAmount = Math.min(tradeUsd, usdtBalance);
      if (usdAmount > 1) {
        const btcAmount = usdAmount / price;
        buyBtc(usdAmount);
        executed = true;
        executedBtcSize = btcAmount;
      }
    } else {
      if (btcBalance <= 0) return;

      const desiredBtc = tradeUsd / price;
      const btcAmount = Math.min(desiredBtc, btcBalance);

      if (btcAmount > 0) {
        sellBtc(btcAmount);
        executed = true;
        executedBtcSize = btcAmount;
      }
    }

    if (!executed) return;

    addBotHistoryEntry({
      time: Date.now(),
      side: direction === 'buy' ? 'BUY' : 'SELL',
      price,
      size: executedBtcSize,
    });
  },

  // --------- big GA autotrader logic ---------

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
    const population = Array.from(
      { length: GA_CONFIG.POPULATION_SIZE },
      (_, i) => createIndividual(randomGenotype(), i)
    );
    set((state) => ({
      autoTrader: { ...state.autoTrader, population, generation: 1 },
    }));
  },

  runGABotLogic: () => {
    const { autoTrader, price, buyBtc, sellBtc, addBotHistoryEntry } = get();
    const { episodeStartTime, priceHistory, population } = autoTrader;

    if (
      !episodeStartTime ||
      Date.now() - episodeStartTime < GA_CONFIG.EPISODE_DURATION
    ) {
      const updatedPopulation = population.map((ind) => {
        const g = ind.genotype;
        if (priceHistory.length < g.long_p) return ind;

        const closePrices = priceHistory.map((p) => p.price);
        const s_ma_series = closePrices.slice(-g.short_p);
        const l_ma_series = closePrices.slice(-g.long_p);
        const s_ma =
          s_ma_series.reduce((a, b) => a + b, 0) / s_ma_series.length;
        const l_ma =
          l_ma_series.reduce((a, b) => a + b, 0) / l_ma_series.length;

        const signal = (s_ma - l_ma) / (price + 1e-12);

        let { position, entryPrice, pnl, cooldownCounter, trades } = ind;

        if (cooldownCounter > 0) cooldownCounter -= 1;

        if (ind.id === 0) {
          if (position === 'flat' && cooldownCounter === 0) {
            if (signal > g.entry_thr) {
              buyBtc(GA_CONFIG.TRADE_AMOUNT_USD);
              position = 'long';
              entryPrice = price;
            }
          } else if (position === 'long') {
            const ret = (price - entryPrice) / entryPrice;

            if (ret >= g.take_profit || ret <= -g.stop_loss) {
              sellBtc(); // close

              const tradeNotional = GA_CONFIG.TRADE_AMOUNT_USD;
              const sizeInBtc = tradeNotional / entryPrice;

              addBotHistoryEntry({
                time: Date.now(),
                side: 'BUY',
                price: entryPrice,
                size: sizeInBtc,
              });

              position = 'flat';
              cooldownCounter = g.cooldown;
            }
          }
        } else {
          if (position === 'flat' && cooldownCounter === 0) {
            if (signal > g.entry_thr) {
              position = 'long';
              entryPrice = price * (1 + GA_CONFIG.SLIPPAGE);
            } else if (signal < -g.entry_thr) {
              position = 'short';
              entryPrice = price * (1 - GA_CONFIG.SLIPPAGE);
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
              trades += 1;
            }
          }
        }

        return { ...ind, position, entryPrice, pnl, cooldownCounter, trades };
      });

      set((state) => ({
        autoTrader: { ...state.autoTrader, population: updatedPopulation },
      }));
    } else {
      get().evolveNextGeneration();
    }
  },

  evolveNextGeneration: () => {
    set((state) => {
      const price = get().price;

      const finalPopulation: Individual[] = state.autoTrader.population.map(
        (ind): Individual => {
          let { pnl, position, entryPrice } = ind;

          if (ind.id !== 0 && position !== 'flat') {
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
            trades: 0,
            position: 'flat',
          };
        }
      );

      finalPopulation.sort((a, b) => b.fitness - a.fitness);

      const next_pop: Individual[] = [];
      next_pop.push(createIndividual(finalPopulation[0].genotype, 0));
      for (let i = 1; i < GA_CONFIG.ELITE_COUNT; i++) {
        next_pop.push(createIndividual(finalPopulation[i].genotype, i));
      }

      while (next_pop.length < GA_CONFIG.POPULATION_SIZE) {
        const tournament = (pop: Individual[]): Genotype => {
          let best: Individual | null = null;
          for (let i = 0; i < GA_CONFIG.TOURNAMENT_SIZE; i++) {
            const r = pop[Math.floor(Math.random() * pop.length)];
            if (!best || r.fitness > best.fitness) best = r;
          }
          return best!.genotype;
        };

        const parentA = tournament(finalPopulation);
        const parentB = tournament(finalPopulation);

        const alpha = Math.random();
        const childG = new Genotype(
          Math.round(parentA.short_p * alpha + parentB.short_p * (1 - alpha)),
          Math.round(parentA.long_p * alpha + parentB.long_p * (1 - alpha)),
          parentA.entry_thr * alpha + parentB.entry_thr * (1 - alpha),
          parentA.take_profit * alpha + parentB.take_profit * (1 - alpha),
          parentA.stop_loss * alpha + parentB.stop_loss * (1 - alpha),
          Math.round(
            parentA.cooldown * alpha + parentB.cooldown * (1 - alpha)
          )
        );

        if (childG.short_p >= childG.long_p) childG.long_p = childG.short_p + 1;
        if (childG.short_p < 1) childG.short_p = 1;

        const mutate = (g: Genotype): Genotype => {
          const m = new Genotype(
            g.short_p,
            g.long_p,
            g.entry_thr,
            g.take_profit,
            g.stop_loss,
            g.cooldown
          );

          const mutateField = (field: keyof Genotype, isInt = false) => {
            if (Math.random() < GA_CONFIG.MUTATION_PROB) {
              // @ts-ignore
              const sigma = Math.max(
                Math.abs(m[field]) * GA_CONFIG.MUTATION_SCALE,
                1e-6
              );
              const gauss =
                (Math.random() - 0.5) +
                (Math.random() - 0.5) +
                (Math.random() - 0.5);
              // @ts-ignore
              m[field] += gauss * sigma;
              // @ts-ignore
              if (isInt) m[field] = Math.max(1, Math.round(m[field]));
            }
          };

          mutateField('short_p', true);
          mutateField('long_p', true);
          mutateField('entry_thr');
          mutateField('take_profit');
          mutateField('stop_loss');
          mutateField('cooldown', true);

          if (m.short_p >= m.long_p) m.long_p = m.short_p + 1;
          m.entry_thr = Math.max(1e-6, m.entry_thr);
          m.take_profit = Math.max(1e-6, m.take_profit);
          m.stop_loss = Math.max(1e-6, m.stop_loss);
          m.cooldown = Math.max(0, Math.round(m.cooldown));

          return m;
        };

        const mutatedChild = mutate(childG);
        next_pop.push(createIndividual(mutatedChild, next_pop.length));
      }

      return {
        autoTrader: {
          ...state.autoTrader,
          generation: state.autoTrader.generation + 1,
          population: next_pop,
          episodeStartTime: Date.now(),
        },
      };
    });
  },
}));
