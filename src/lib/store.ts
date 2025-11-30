import { create } from 'zustand';

export type Order = [string, string, string?]; // [price, quantity, cumulative?]

export interface Position {
  entryPrice: number;
  direction: 'buy' | 'sell';
  timestamp: number;
}

export interface Trade {
  price: number;
  quantity: number;
  time: number;
  isMaker: boolean; // Corresponds to 'm' in Binance stream - true if buyer is maker
}

// --- Genetic Algorithm State ---
const GA_CONFIG = {
  POPULATION_SIZE: 50,
  ELITE_COUNT: 4,
  TOURNAMENT_SIZE: 5,
  MUTATION_PROB: 0.25,
  MUTATION_SCALE: 0.15,
  EPISODE_DURATION: 2 * 60 * 1000, // 2 minutes
  TRANSACTION_COST: 0.0005, // 0.05% per trade (round-trip you'll model twice)
  SLIPPAGE: 0.0005, // 0.05%
  TRADE_AMOUNT_USD: 100, // Amount for the main bot to trade
};

// --- This is a TypeScript equivalent of the Python dataclass ---
export class Genotype {
    short_p: number;
    long_p: number;
    entry_thr: number;
    take_profit: number;
    stop_loss: number;
    cooldown: number;

    constructor(short_p: number, long_p: number, entry_thr: number, take_profit: number, stop_loss: number, cooldown: number) {
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
  fitness: number; // P&L from the last episode
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
// --- End GA State ---

interface AppState {
  price: number;
  priceChange: 'up' | 'down' | 'same';
  position: Position | null;
  pnl: number;
  sentiment: number;
  sentimentHistory: number[];
  sparklineData: { time: number; value: number }[];
  depthData: {
    bids: Order[];
    asks: Order[];
  };
  trades: Trade[];
  usdtBalance: number;
  btcBalance: number;
  autoTrader: AutoTraderState;
}

interface AppActions {
  setPrice: (price: number) => void;
  setDepthData: (data: { bids: Order[]; asks: Order[] }) => void;
  setSparklineData: (data: { time: number; value: number }) => void;
  setSentiment: (value: number) => void;
  addTrade: (trade: Trade) => void;
  enterPosition: (direction: 'buy' | 'sell') => void;
  closePosition: () => void;
  updatePnl: () => void;
  buyBtc: (usdAmount?: number) => void;
  sellBtc: (btcAmount?: number) => void;
  // --- GA Actions ---
  startGA: () => void;
  stopGA: () => void;
  runGABotLogic: () => void;
  initializePopulation: () => void;
  evolveNextGeneration: () => void;
}

// --- GA Utility Functions (adapted from Python) ---
function randomGenotype(): Genotype {
  const short_p = Math.floor(Math.random() * 11) + 1; // 1 to 12
  const long_p = short_p + Math.floor(Math.random() * 110) + 1; // short_p+1 to short_p+110
  const entry_thr = 10 ** (Math.log10(1e-5) + Math.random() * (Math.log10(0.005) - Math.log10(1e-5)));
  const take_profit = 10 ** (Math.log10(1e-4) + Math.random() * (Math.log10(0.05) - Math.log10(1e-4)));
  const stop_loss = take_profit * (0.5 + Math.random() * 1.5);
  const cooldown = Math.floor(Math.random() * 4); // 0 to 3 ticks
  return new Genotype(short_p, long_p, entry_thr, take_profit, stop_loss, cooldown);
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
// --- End GA Utils ---


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
  usdtBalance: 10000,
  btcBalance: 0,
  autoTrader: {
    gaStatus: 'idle',
    generation: 0,
    population: [],
    episodeStartTime: null,
    priceHistory: [],
  },

  setPrice: (price) => {
    const oldPrice = get().price;
    set((state) => ({
      price,
      priceChange: price > oldPrice ? 'up' : price < oldPrice ? 'down' : 'same',
      autoTrader: {
        ...state.autoTrader,
        priceHistory: [...state.autoTrader.priceHistory, { time: Date.now(), price }].slice(-500),
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
      if (newData.length > 100) {
        newData.shift();
      }
      return { sparklineData: newData };
    });
  },
  setSentiment: (value) => {
    set((state) => {
      const newHistory = [...state.sentimentHistory, value];
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      return { sentiment: value, sentimentHistory: newHistory };
    });
  },
  addTrade: (trade) => {
    set((state) => {
      const newTrades = [trade, ...state.trades];
      if (newTrades.length > 50) {
        newTrades.pop();
      }
      return { trades: newTrades };
    });
  },
  enterPosition: (direction) => {
    const currentPrice = get().price;
    if (currentPrice > 0 && !get().position) {
      set({
        position: {
          entryPrice: currentPrice,
          direction,
          timestamp: Date.now(),
        },
        pnl: 0,
      });
    }
  },
  closePosition: () => {
    const { pnl } = get();
    set((state) => ({
      position: null,
      pnl: 0,
      usdtBalance: state.usdtBalance + pnl,
    }));
  },
  updatePnl: () => {
    const { position, price } = get();
    if (position) {
      const pnl = (price - position.entryPrice) * (position.direction === 'buy' ? 1 : -1);
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
      const amountToSell = btcAmountToSell ? Math.min(btcAmountToSell, btcBalance) : btcBalance;
       if (btcBalance >= amountToSell) {
        const usdtAmount = amountToSell * price;
        set((state) => ({
          usdtBalance: state.usdtBalance + usdtAmount,
          btcBalance: state.btcBalance - amountToSell,
        }));
      }
    }
  },

  // --- Genetic Algorithm Logic ---
  startGA: () => {
    get().initializePopulation();
    set((state) => ({
      autoTrader: { ...state.autoTrader, gaStatus: 'running', episodeStartTime: Date.now() },
    }));
  },
  stopGA: () => {
    set((state) => ({
      autoTrader: { ...state.autoTrader, gaStatus: 'idle', episodeStartTime: null, generation: 0, population: [] },
    }));
  },
  
  initializePopulation: () => {
    const population = Array.from({ length: GA_CONFIG.POPULATION_SIZE }, (_, i) => createIndividual(randomGenotype(), i));
    set(state => ({
      autoTrader: { ...state.autoTrader, population, generation: 1 }
    }));
  },

  runGABotLogic: () => {
    const { autoTrader, price, buyBtc, sellBtc, btcBalance } = get();
    const { episodeStartTime, priceHistory, population } = autoTrader;

    if (!episodeStartTime || Date.now() - episodeStartTime < GA_CONFIG.EPISODE_DURATION) {
      // --- Episode is running, evaluate each individual ---
      const updatedPopulation = population.map(ind => {
          const g = ind.genotype;
          if (priceHistory.length < g.long_p) return ind; // Not enough data
  
          // Calculate MAs from recent history
          const closePrices = priceHistory.map(p => p.price);
          const s_ma_series = closePrices.slice(-g.short_p);
          const l_ma_series = closePrices.slice(-g.long_p);
          const s_ma = s_ma_series.reduce((a, b) => a + b, 0) / s_ma_series.length;
          const l_ma = l_ma_series.reduce((a, b) => a + b, 0) / l_ma_series.length;
          
          const signal = (s_ma - l_ma) / (price + 1e-12);
          
          let { position, entryPrice, pnl, cooldownCounter, trades } = ind;
  
          if (cooldownCounter > 0) {
              cooldownCounter -= 1;
          }

          // Trading logic for the "champion" bot (id === 0)
          if (ind.id === 0) {
              if (position === 'flat' && cooldownCounter === 0) {
                if (signal > g.entry_thr) { // Buy signal
                    buyBtc(GA_CONFIG.TRADE_AMOUNT_USD);
                    position = 'long';
                    entryPrice = price; // Record entry for this bot
                }
              } else if (position === 'long') {
                const ret = (price - entryPrice) / entryPrice;
                 if (ret >= g.take_profit || ret <= -g.stop_loss) {
                    sellBtc(); // Sell all BTC
                    position = 'flat';
                    cooldownCounter = g.cooldown;
                 }
              }
              // NOTE: Short selling is not implemented for the main balance, so we only handle long positions.
          } else { // Simulation logic for all other bots
            // Entry logic
            if (position === 'flat' && cooldownCounter === 0) {
                if (signal > g.entry_thr) {
                    position = 'long';
                    entryPrice = price * (1 + GA_CONFIG.SLIPPAGE);
                } else if (signal < -g.entry_thr) {
                    position = 'short';
                    entryPrice = price * (1 - GA_CONFIG.SLIPPAGE);
                }
            }
    
            // Exit logic
            if (position !== 'flat') {
                const ret = position === 'long' ? (price - entryPrice) / entryPrice : (entryPrice - price) / entryPrice;
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
      set(state => ({ autoTrader: {...state.autoTrader, population: updatedPopulation }}));

    } else {
      // --- Episode finished, evolve to next generation ---
      get().evolveNextGeneration();
    }
  },
  
  evolveNextGeneration: () => {
    set((state) => {
      // Finalize P&L for any open positions in simulation
      const finalPopulation = state.autoTrader.population.map(ind => {
        let { pnl, position, entryPrice } = ind;
        if (ind.id !== 0 && position !== 'flat') { // Only for simulated bots
          const ret = position === 'long' ? (get().price - entryPrice) / entryPrice : (entryPrice - get().price) / entryPrice;
          pnl += ret - GA_CONFIG.TRANSACTION_COST;
        }
        return { ...ind, fitness: pnl, pnl: 0, trades: 0, position: 'flat' }; // Reset for next gen
      });

      // Sort by fitness
      finalPopulation.sort((a, b) => b.fitness - a.fitness);

      // --- GA Operators ---
      const next_pop_individuals: Individual[] = [];
      
      // 1. Elitism: The best performer gets id:0 and will trade for real
      next_pop_individuals.push(createIndividual(finalPopulation[0].genotype, 0));

      for (let i = 1; i < GA_CONFIG.ELITE_COUNT; i++) {
        next_pop_individuals.push(createIndividual(finalPopulation[i].genotype, i));
      }

      // 2. Crossover & Mutation
      while (next_pop_individuals.length < GA_CONFIG.POPULATION_SIZE) {
        // Parent Selection (Tournament)
        const tournament = (pop: Individual[]): Genotype => {
          let best: Individual | null = null;
          for (let i = 0; i < GA_CONFIG.TOURNAMENT_SIZE; i++) {
            const randomInd = pop[Math.floor(Math.random() * pop.length)];
            if (best === null || randomInd.fitness > best.fitness) {
              best = randomInd;
            }
          }
          return best!.genotype;
        };

        const parentA = tournament(finalPopulation);
        const parentB = tournament(finalPopulation);
        
        // Crossover (Arithmetic)
        const alpha = Math.random();
        const childGeno = new Genotype(
          Math.round(parentA.short_p * alpha + parentB.short_p * (1-alpha)),
          Math.round(parentA.long_p * alpha + parentB.long_p * (1-alpha)),
          parentA.entry_thr * alpha + parentB.entry_thr * (1-alpha),
          parentA.take_profit * alpha + parentB.take_profit * (1-alpha),
          parentA.stop_loss * alpha + parentB.stop_loss * (1-alpha),
          Math.round(parentA.cooldown * alpha + parentB.cooldown * (1-alpha)),
        );

        // Ensure valid params after crossover
        if (childGeno.short_p >= childGeno.long_p) childGeno.long_p = childGeno.short_p + 1;
        if(childGeno.short_p < 1) childGeno.short_p = 1;

        // Mutation (Gaussian)
        const mutate = (g: Genotype): Genotype => {
          const m = new Genotype(g.short_p, g.long_p, g.entry_thr, g.take_profit, g.stop_loss, g.cooldown);
          const mutateField = (field: keyof Genotype, isInt = false) => {
            if (Math.random() < GA_CONFIG.MUTATION_PROB) {
              // @ts-ignore
              const sigma = Math.max(Math.abs(m[field]) * GA_CONFIG.MUTATION_SCALE, 1e-6);
              // A simple way to get a normal-like random number (Box-Muller-ish)
              const gauss = (Math.random() - 0.5) + (Math.random() - 0.5) + (Math.random() - 0.5);
              // @ts-ignore
              m[field] += gauss * sigma;
              // @ts-ignore
              if (isInt) m[field] = Math.max(1, Math.round(m[field]));
            }
          }
          mutateField('short_p', true);
          mutateField('long_p', true);
          mutateField('entry_thr');
          mutateField('take_profit');
          mutateField('stop_loss');
          mutateField('cooldown', true);
          
          if(m.short_p >= m.long_p) m.long_p = m.short_p + 1;
          m.entry_thr = Math.max(1e-6, m.entry_thr);
          m.take_profit = Math.max(1e-6, m.take_profit);
          m.stop_loss = Math.max(1e-6, m.stop_loss);
          m.cooldown = Math.max(0, Math.round(m.cooldown));

          return m;
        }

        const mutatedChildGeno = mutate(childGeno);
        
        next_pop_individuals.push(createIndividual(mutatedChildGeno, next_pop_individuals.length));
      }

      return {
        autoTrader: {
          ...state.autoTrader,
          generation: state.autoTrader.generation + 1,
          population: next_pop_individuals,
          episodeStartTime: Date.now(), // Start next episode
        }
      };
    });
  }
}));