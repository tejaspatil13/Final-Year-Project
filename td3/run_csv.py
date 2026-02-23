"""
Run TD3 on CSV data and export results (OHLC, portfolio, actions, metrics) as JSON for the frontend.
Usage (from project root):  cd td3 && python run_csv.py
Or:  python run_csv.py --csv "CSV file/AAPL_data.csv" --out "../frontend/public/td3_results.json"
"""
import argparse
import json
import os
import sys

import numpy as np
import pandas as pd

# Add td3 directory to path so "from src.xxx" works from both td3/ and project root
_td3_dir = os.path.dirname(os.path.abspath(__file__))
if _td3_dir not in sys.path:
    sys.path.insert(0, _td3_dir)

from src.data.csv_preprocess import load_and_preprocess_csv
from src.model.trading_environment import TradingEnvironment
from src.model.td3 import TD3
from src.utils.logger import setup_logging

logger = setup_logging()

# Default paths relative to project root (parent of td3)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CSV = os.path.join(PROJECT_ROOT, "CSV file", "AAPL_data.csv")
DEFAULT_OUT = os.path.join(PROJECT_ROOT, "frontend", "public", "td3_results.json")
DEFAULT_RESULTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results")


def set_seeds(seed=42):
    import random
    import torch
    np.random.seed(seed)
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)


def run_inference_and_export(
    csv_path: str,
    output_json_path: str,
    results_dir: str,
    lookback_window: int = 60,
    frame_stack: int = 4,
    max_episodes: int = 30,
    max_timesteps: int = 50000,
    eval_freq: int = 5,
):
    print("\n[TD3] Running model on CSV. Model output with explanations will be printed at the end.\n")
    set_seeds()
    os.makedirs(results_dir, exist_ok=True)

    logger.info("Loading and preprocessing CSV: %s", csv_path)
    train_df, val_df, test_df = load_and_preprocess_csv(csv_path)

    # Keep raw OHLC for chart (from original CSV)
    raw_df = pd.read_csv(csv_path)
    raw_df = raw_df.rename(columns={
        "Date": "date", "Open": "open", "High": "high", "Low": "low", "Close": "close", "Volume": "volume",
    })
    raw_df["date"] = pd.to_datetime(raw_df["date"]).astype(str)

    train_env = TradingEnvironment(
        train_df, lookback_window=lookback_window, transaction_cost=0.0003,
        max_position=1.0, frame_stack=frame_stack,
    )
    val_env = TradingEnvironment(
        val_df, lookback_window=lookback_window, transaction_cost=0.0003,
        max_position=1.0, frame_stack=frame_stack,
    )
    test_env = TradingEnvironment(
        test_df, lookback_window=lookback_window, transaction_cost=0.0003,
        max_position=1.0, frame_stack=frame_stack,
    )

    state_dim = train_env.get_state_dim()
    action_dim = 1
    max_action = 1.0

    policy = TD3(
        state_dim=state_dim, action_dim=action_dim, max_action=max_action,
        discount=0.995, tau=0.0005, policy_noise=0.15, noise_clip=0.35, policy_freq=4,
    )

    from src.model.replay_buffer import ReplayBuffer
    replay_buffer = ReplayBuffer(state_dim, action_dim)

    best_val_sharpe = -float("inf")
    exploration_noise = 0.1

    logger.info("Training TD3 (short run for demo)...")
    for episode in range(1, max_episodes + 1):
        state = train_env.reset()
        done = False
        total_timesteps = (episode - 1) * 5000  # approximate
        episode_timesteps = 0

        while not done and episode_timesteps < max_timesteps:
            episode_timesteps += 1
            total_timesteps += 1
            if total_timesteps < 1000:
                action = np.random.uniform(-max_action, max_action, size=(action_dim,))
            else:
                action = policy.select_action(np.array(state))
                action = action + np.random.normal(0, exploration_noise, size=action_dim)
                action = np.clip(action, -max_action, max_action)
            next_state, reward, done, _ = train_env.step(action[0])
            replay_buffer.add(state, action, next_state, reward, done)
            state = next_state
            if total_timesteps >= 5000:
                policy.train(replay_buffer, batch_size=256)

        if episode % eval_freq == 0:
            val_state = val_env.reset()
            val_done = False
            while not val_done:
                a = policy.select_action(np.array(val_state))
                val_state, _, val_done, _ = val_env.step(a[0])
            val_returns = np.array(val_env.portfolio_history[1:]) / np.array(val_env.portfolio_history[:-1]) - 1
            val_sharpe = np.mean(val_returns) / (np.std(val_returns) + 1e-8) * np.sqrt(252)
            if val_sharpe > best_val_sharpe:
                best_val_sharpe = val_sharpe
                policy.save(os.path.join(results_dir, "td3_best_model"))
            logger.info("Episode %d | Val Sharpe %.4f", episode, val_sharpe)

    policy.save(os.path.join(results_dir, "td3_final_model"))
    policy.load(os.path.join(results_dir, "td3_best_model"))

    # Run on test set and collect outputs
    test_state = test_env.reset()
    test_done = False
    test_actions = []
    test_positions = []

    while not test_done:
        test_action = policy.select_action(np.array(test_state))
        test_actions.append(float(test_action[0]))
        test_state, _, test_done, _ = test_env.step(test_action[0])
        test_positions.append(float(test_env.current_position))

    test_returns = np.array(test_env.portfolio_history[1:]) / np.array(test_env.portfolio_history[:-1]) - 1
    test_sharpe = float(np.mean(test_returns) / (np.std(test_returns) + 1e-8) * np.sqrt(252))
    test_return_pct = (test_env.portfolio_value - 1.0) * 100
    test_drawdown_pct = float(test_env.max_drawdown * 100)

    # Align test period with raw data: test set starts at 85% of data; env steps from lookback_window
    test_start_idx = int(0.85 * len(raw_df))
    test_raw = raw_df.iloc[test_start_idx:].reset_index(drop=True)
    lookback = lookback_window
    n_steps = len(test_actions)
    test_slice = test_raw.iloc[lookback : lookback + n_steps]
    test_dates = test_slice["date"].tolist()
    test_open = test_slice["open"].tolist()
    test_high = test_slice["high"].tolist()
    test_low = test_slice["low"].tolist()
    test_close = test_slice["close"].tolist()
    portfolio_history = [float(x) for x in test_env.portfolio_history]
    if len(portfolio_history) > n_steps + 1:
        portfolio_history = portfolio_history[: n_steps + 1]

    # Direction accuracy: % of steps where model position sign matched next price move sign
    test_close_arr = np.array(test_close, dtype=float)
    if n_steps >= 2:
        forward_returns = (test_close_arr[1:n_steps] - test_close_arr[: n_steps - 1]) / (test_close_arr[: n_steps - 1] + 1e-12)
        position_sign = np.sign(test_positions[: n_steps - 1])
        return_sign = np.sign(forward_returns)
        match = (position_sign == return_sign) & (position_sign != 0)
        direction_accuracy_pct = float(np.mean(match) * 100) if np.any(position_sign != 0) else 50.0
    else:
        direction_accuracy_pct = 50.0

    payload = {
        "metrics": {
            "sharpeRatio": round(test_sharpe, 4),
            "returnPct": round(test_return_pct, 2),
            "maxDrawdownPct": round(test_drawdown_pct, 2),
            "finalPortfolioValue": round(float(test_env.portfolio_value), 4),
            "directionAccuracyPct": round(direction_accuracy_pct, 2),
        },
        "ohlc": [
            {"date": d, "open": o, "high": h, "low": l, "close": c}
            for d, o, h, l, c in zip(test_dates, test_open, test_high, test_low, test_close)
        ],
        "portfolioHistory": portfolio_history,
        "actions": test_actions,
        "positions": test_positions,
    }

    os.makedirs(os.path.dirname(output_json_path) or ".", exist_ok=True)
    with open(output_json_path, "w") as f:
        json.dump(payload, f, indent=2)

    logger.info("Exported results to %s", output_json_path)
    logger.info("Test metrics: Return=%.2f%%, Sharpe=%.4f, MaxDD=%.2f%%", test_return_pct, test_sharpe, test_drawdown_pct)

    print_model_output_summary(payload)
    return payload


def print_model_output_summary(payload):
    """Print model output in terminal with easy-language explanations."""
    m = payload["metrics"]

    sep = "=" * 60
    print()
    print(sep)
    print("  TD3 MODEL OUTPUT — What each number means")
    print(sep)
    print()
    print("  1. RETURN % (returnPct)")
    print("     What it is: How much your money grew (or shrank) on the test period.")
    print("     Meaning:    +10 means +10% profit, -5 means 5% loss.")
    print("     Your value: {:.2f}%".format(m["returnPct"]))
    print()
    print("  2. SHARPE RATIO (sharpeRatio)")
    print("     What it is: Reward per unit of risk. Higher = better risk-adjusted returns.")
    print("     Meaning:    > 1 is good, > 2 is very good, < 0 means losing money on average.")
    print("     Your value: {:.4f}".format(m["sharpeRatio"]))
    print()
    print("  3. MAX DRAWDOWN % (maxDrawdownPct)")
    print("     What it is: Worst peak-to-bottom drop in portfolio value (in %).")
    print("     Meaning:    20 means at some point you were 20% below a previous high.")
    print("     Your value: {:.2f}%".format(m["maxDrawdownPct"]))
    print()
    print("  4. FINAL PORTFOLIO VALUE (finalPortfolioValue)")
    print("     What it is: Strategy value at the end (start = 1.0).")
    print("     Meaning:    1.05 = 5% gain, 0.95 = 5% loss.")
    print("     Your value: {:.4f}".format(m["finalPortfolioValue"]))
    print()
    print("  5. DIRECTION ACCURACY % (directionAccuracyPct)  [like 'model accuracy']")
    print("     What it is: How often the model was on the right side of the market.")
    print("     Meaning:    When model was long, price went up; when short, price went down.")
    print("     50% = random; above 50% = better than coin flip; below 50% = wrong more often.")
    print("     Your value: {:.2f}%".format(m.get("directionAccuracyPct", 50.0)))
    print()
    print("  ---")
    print("  POSITION & SIGNAL (in the charts)")
    print("  ---")
    print("  • Signal (Action): The number the model outputs each day (-1 to +1).")
    print("    +1 = model wants to be fully invested (long), -1 = fully out/short, 0 = neutral.")
    print("  • Position:       How much you actually hold at that time (same scale -1 to +1).")
    print("    Usually same as signal; both show how bullish or bearish the model was.")
    print()
    print(sep)
    print()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default=DEFAULT_CSV, help="Path to CSV file")
    parser.add_argument("--out", default=DEFAULT_OUT, help="Output JSON path for frontend")
    parser.add_argument("--results-dir", default=DEFAULT_RESULTS_DIR, help="Directory for TD3 checkpoints")
    parser.add_argument("--episodes", type=int, default=30, help="Training episodes")
    args = parser.parse_args()

    run_inference_and_export(
        csv_path=args.csv,
        output_json_path=args.out,
        results_dir=args.results_dir,
        max_episodes=args.episodes,
    )


if __name__ == "__main__":
    main()
