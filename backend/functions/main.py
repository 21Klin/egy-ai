# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy --only functions`

from firebase_functions import https_fn
from firebase_admin import initialize_app
import pandas as pd
import numpy as np
from ta.momentum import RSIIndicator
import time
import threading
from flask import jsonify, Flask, request
from flask_cors import CORS
import werkzeug.wrappers
import random

initialize_app()
flask_app = Flask(__name__)
CORS(flask_app)


# --- Global State for the GA ---
# Using a class to hold state makes it cleaner to manage
# This global instance will persist across invocations on the same function instance.
class GAState:
    def __init__(self):
        self.running = False
        self.generation = 0
        self.best_fitness = -np.inf
        self.best_genome = None
        self.last_trade = None
        self.lock = threading.Lock()
        self.thread = None
        self.historical_data = pd.DataFrame()

    def reset(self):
        with self.lock:
            self.running = False
            self.generation = 0
            self.best_fitness = -np.inf
            self.best_genome = None
            self.last_trade = None
            print("GA state has been reset.")

ga_state = GAState()


# --- Genetic Algorithm Components ---

def create_individual():
    """Create a random individual (genome)."""
    return {
        "fast_ma": np.random.randint(5, 25),
        "slow_ma": np.random.randint(30, 80),
        "rsi_period": np.random.randint(10, 25),
        "rsi_low": np.random.randint(20, 40),
        "rsi_high": np.random.randint(60, 85),
    }

def calculate_fitness(genome, df):
    """Calculate the fitness of an individual based on backtest performance."""
    if df.empty or len(df) <= genome.get('slow_ma', 100):
        # Not enough data for the longest moving average
        return -np.inf, None

    df_signal = generate_signals(df.copy(), genome)
    if df_signal is None or 'position' not in df_signal.columns or df_signal['position'].isnull().all():
        return -np.inf, None

    # Simple profit/loss calculation from strategy returns
    df_signal['returns'] = df_signal['Close'].pct_change()
    df_signal['strategy_returns'] = df_signal['returns'] * df_signal['position'].shift(1)

    cumulative_returns = (1 + df_signal['strategy_returns'].fillna(0)).cumprod()
    final_equity = cumulative_returns.iloc[-1] if not cumulative_returns.empty else 1.0

    return final_equity, df_signal


def generate_signals(df, genome):
    """Generate trading signals for a given genome."""
    # CRITICAL BUG FIX: Ensure fast_ma is always less than slow_ma.
    if genome['fast_ma'] >= genome['slow_ma']:
        return None

    try:
        df["ma_fast"] = df["Close"].rolling(window=genome['fast_ma']).mean()
        df["ma_slow"] = df["Close"].rolling(window=genome['slow_ma']).mean()
        rsi_indicator = RSIIndicator(close=df["Close"], window=genome['rsi_period'])
        df["rsi"] = rsi_indicator.rsi()
    except Exception as e:
        print(f"Error calculating indicators for genome {genome}: {e}")
        return None # Return None to signal failure

    # Ensure all columns were created successfully and are not all NaN
    if "ma_fast" not in df.columns or "ma_slow" not in df.columns or "rsi" not in df.columns or df['ma_fast'].isnull().all() or df['ma_slow'].isnull().all():
        return None

    df['signal'] = 0
    # Long condition: Fast MA crosses above Slow MA AND RSI is not overbought
    long_condition = (df['ma_fast'] > df['ma_slow']) & (df['rsi'] < genome['rsi_high'])
    df.loc[long_condition, 'signal'] = 1
    
    # Exit condition: Fast MA crosses below Slow MA
    short_condition = (df['ma_fast'] < df['ma_slow'])
    df.loc[short_condition, 'signal'] = -1
    
    df['position'] = df['signal']
    return df

def select_parents(population, fitness_scores, num_parents):
    """Select the best individuals to be parents for the next generation."""
    parents = []
    # Use np.argsort to get indices of the sorted scores (descending)
    indices = np.argsort(fitness_scores)[::-1]
    
    for i in range(num_parents):
        parents.append(population[indices[i]])
        
    return parents

def crossover(parent1, parent2):
    """Create a new individual by combining genes from two parents."""
    child = {}
    for key in parent1.keys():
        if random.random() < 0.5:
            child[key] = parent1[key]
        else:
            child[key] = parent2[key]
    return child

def mutate(individual, mutation_rate=0.1):
    """Randomly change a gene in an individual."""
    for key in individual.keys():
        if random.random() < mutation_rate:
            if 'ma' in key:
                change = np.random.randint(-5, 6)
            else:
                change = np.random.randint(-2, 3)
            individual[key] += change

            # Apply strict validation after mutation
            if 'fast_ma' in key:
                individual[key] = max(5, min(95, individual[key]))
            elif 'slow_ma' in key:
                 individual[key] = max(10, min(100, individual[key]))
            elif 'rsi_period' in key:
                 individual[key] = max(5, min(30, individual[key]))
            elif 'rsi_low' in key:
                 individual[key] = max(10, min(45, individual[key]))
            elif 'rsi_high' in key:
                 individual[key] = max(55, min(90, individual[key]))

    # CRITICAL BUG FIX: Final check to ensure fast_ma is ALWAYS less than slow_ma.
    if individual['fast_ma'] >= individual['slow_ma']:
        # If they are invalid, set fast_ma to a safe value relative to slow_ma.
        individual['fast_ma'] = max(5, individual['slow_ma'] - 5)

    return individual


# --- Main GA Loop ---

def evolution_loop():
    """The main loop for the genetic algorithm. This runs in a background thread."""
    population_size = 20
    num_parents = 10
    
    print("Evolution loop started.")
    
    population = [create_individual() for _ in range(population_size)]

    while True:
        # Check for stop signal at the very beginning of the loop
        with ga_state.lock:
            if not ga_state.running:
                print("Detected stop signal. Exiting evolution loop.")
                break
        
        with ga_state.lock:
            ga_state.generation += 1
            current_generation = ga_state.generation
            df_hist = ga_state.historical_data.copy()
            # Clear the trade signal at the start of a generation
            ga_state.last_trade = None

        print(f"--- Starting Generation {current_generation} ---")

        # Robustness: Ensure we have enough data before proceeding
        if df_hist.empty or len(df_hist) < 100:
            print("Historical data is empty or insufficient, skipping generation. Sleeping for 10s.")
            time.sleep(10)
            with ga_state.lock:
                ga_state.generation -=1 # Don't count this as a real generation
            continue
            
        fitness_scores = []
        signal_dfs = []

        # Calculate fitness for the entire population
        for ind in population:
            fitness, signal_df = calculate_fitness(ind, df_hist)
            fitness_scores.append(fitness)
            signal_dfs.append(signal_df)

        # Check if any individuals were successfully evaluated
        if not any(s > -np.inf for s in fitness_scores):
            print("No individuals in the population were fit. This may be due to data issues or invalid genomes. Creating new random population.")
            population = [create_individual() for _ in range(population_size)] # Re-initialize
            time.sleep(5) # Brief pause before next attempt
            continue

        best_gen_idx = np.argmax(fitness_scores)
        best_gen_fitness = fitness_scores[best_gen_idx]
        best_gen_genome = population[best_gen_idx]
        best_signals_df = signal_dfs[best_gen_idx]
        
        with ga_state.lock:
            if not ga_state.running: # Double-check before writing state
                break

            # Update the global best if this generation's best is better
            if best_gen_fitness > ga_state.best_fitness:
                ga_state.best_fitness = best_gen_fitness
                ga_state.best_genome = best_gen_genome
                print(f"New global best found in Gen {current_generation}! Fitness: {best_gen_fitness:.4f}, Genome: {best_gen_genome}")

            # Generate the trade signal for this generation based on its best individual
            if best_signals_df is not None and not best_signals_df.empty and 'position' in best_signals_df.columns:
                last_signal = best_signals_df['position'].iloc[-1]
                trade_action = None
                if last_signal == 1:
                    trade_action = 'buy'
                elif last_signal == -1:
                    trade_action = 'sell'

                if trade_action:
                    # Set the trade signal to be picked up by the frontend
                    ga_state.last_trade = {
                        "action": trade_action,
                        "price": df_hist['Close'].iloc[-1],
                        "generation": current_generation
                    }
                    print(f"Trade signal for Gen {current_generation}: {trade_action.upper()} at ${ga_state.last_trade['price']:.2f}")

        # --- EVOLVE: Create the next generation ---
        parents = select_parents(population, fitness_scores, num_parents)
        
        # Keep the best individuals (elitism)
        next_generation = list(parents)
        
        # Create children through crossover and mutation
        num_children_to_create = population_size - len(next_generation)
        for _ in range(num_children_to_create):
            parent1 = random.choice(parents)
            parent2 = random.choice(parents)
            child = crossover(parent1, parent2)
            child = mutate(child)
            next_generation.append(child)
            
        population = next_generation

        print(f"--- Finished Generation {current_generation}. Waiting 120s... ---")
        time.sleep(120)


# --- Flask API Endpoints ---
@flask_app.route('/start', methods=['POST'])
def start_ga():
    with ga_state.lock:
        if ga_state.running:
             print("GA already running.")
             return jsonify({"message": "Genetic Algorithm already running.", "status": get_status_payload(locked=True)})

        ga_state.reset() # Reset state for a clean start
        ga_state.running = True
        # IMPORTANT: Ensure the thread is created correctly
        ga_state.thread = threading.Thread(target=evolution_loop, daemon=True)
        ga_state.thread.start()
        print("GA thread started successfully.")
            
    # Always return a fresh status payload to confirm the state
    return jsonify({"message": "Genetic Algorithm started.", "status": get_status_payload()})

@flask_app.route('/stop', methods=['POST'])
def stop_ga():
    thread_to_join = None
    with ga_state.lock:
        if ga_state.running:
            ga_state.running = False
            thread_to_join = ga_state.thread
            print("Stop signal sent to GA loop.")
        else:
            print("GA already stopped.")
    
    # Wait for the thread to finish outside the lock to avoid deadlocks
    if thread_to_join and thread_to_join.is_alive():
        thread_to_join.join(timeout=5)
        print("GA thread joined.")
    
    # Clean up the thread object after it's stopped
    with ga_state.lock:
        ga_state.thread = None

    return jsonify({"message": "Genetic Algorithm stopped.", "status": get_status_payload()})

@flask_app.route('/status', methods=['GET'])
def status_ga():
    return jsonify(get_status_payload())

@flask_app.route('/update_data', methods=['POST'])
def update_data():
    json_data = request.get_json()
    if not json_data or 'klines' not in json_data:
        return jsonify({"error": "Missing klines data"}), 400

    klines = json_data['klines']
    
    try:
        with ga_state.lock:
            # Correctly handle capitalization from the frontend
            df = pd.DataFrame(klines)
            df.rename(columns={
                'time': 'time',
                'open': 'Open',
                'high': 'High',
                'low': 'Low',
                'close': 'Close',
                'volume': 'Volume'
            }, inplace=True)
            
            # Ensure correct data types
            df = df.astype({'time': 'int64', 'Open': 'float64', 'High': 'float64', 'Low': 'float64', 'Close': 'float64', 'Volume': 'float64'})
            df['time'] = pd.to_datetime(df['time'], unit='s')

            # CRITICAL FIX: DO NOT set a DatetimeIndex. The algorithm expects a simple integer index.
            ga_state.historical_data = df
            print(f"Successfully updated historical data with {len(df)} records.")
        
        return jsonify({"message": f"Data updated with {len(klines)} records."})
    except Exception as e:
        print(f"Error processing data update: {e}")
        return jsonify({"error": f"Failed to process data: {e}"}), 500


def get_status_payload(locked=False):
    """Helper to get a consistent status object. The `locked` parameter avoids deadlocks."""
    if locked: # This block is for when the function is called from within an existing lock
        status_dict = {
            "running": ga_state.running,
            "generation": ga_state.generation,
            "best_fitness": ga_state.best_fitness if ga_state.best_fitness != -np.inf else None,
            "best_genome": ga_state.best_genome,
            "last_trade": ga_state.last_trade
        }
        # Consume the trade signal after reading it
        if ga_state.last_trade:
            ga_state.last_trade = None
        return status_dict
    else: # This block is for external calls, acquiring the lock is necessary
        with ga_state.lock:
            status_dict = {
                "running": ga_state.running,
                "generation": ga_state.generation,
                "best_fitness": ga_state.best_fitness if ga_state.best_fitness != -np.inf else None,
                "best_genome": ga_state.best_genome,
                "last_trade": ga_state.last_trade
            }
            # Consume the trade signal after reading it
            if ga_state.last_trade:
                ga_state.last_trade = None
            return status_dict

# This is a wrapper to integrate Flask with Firebase Cloud Functions
@https_fn.onRequest()
def api(req: https_fn.Request) -> https_fn.Response:
    # Use Flask's context to handle the request
    with flask_app.request_context(req.environ):
        # This is the key change: letting Flask's routing handle the request
        return flask_app.full_dispatch_request()

    