"""
Preprocess OHLCV CSV (Date, Open, High, Low, Close, Volume) for TD3.
Produces same feature set as PreprocessData without requiring API/bid-ask columns.
"""
import pandas as pd
import numpy as np
import logging

logger = logging.getLogger("td3-stock-trading")

FEATURES_TO_NORMALIZE = [
    "open", "high", "low", "close", "spread",
    "return", "log_return", "ma5", "ma10", "volatility", "momentum",
    "macd", "macd_signal", "boll_upper", "boll_lower", "atr", "dpo",
    "cumulative_return",
]


def load_and_preprocess_csv(csv_path: str):
    """Load CSV with columns Date, Open, High, Low, Close, Volume. Return train_df, val_df, test_df."""
    df = pd.read_csv(csv_path)
    # Normalize column names to lowercase
    df = df.rename(columns={
        "Date": "time",
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Volume": "volume",
    })
    if "time" not in df.columns and "date" in df.columns:
        df["time"] = df["date"]
    df["time"] = pd.to_datetime(df["time"])
    df = df.sort_values("time").reset_index(drop=True)
    df["spread"] = 0.0  # CSV has single price; no spread

    logger.info("Feature engineering (returns, MAs, volatility, RSI, MACD, Bollinger, ATR, DPO)")
    df["return"] = df["close"].pct_change().fillna(0)
    df["log_return"] = np.log(df["close"] / df["close"].shift(1)).fillna(0)
    df["ma5"] = df["close"].rolling(window=5).mean()
    df["ma10"] = df["close"].rolling(window=10).mean()
    df["ma_norm"] = df["close"] / df["ma5"]
    df["cumulative_return"] = (1 + df["return"]).cumprod() - 1

    high_low = df["high"] - df["low"]
    high_close_prev = abs(df["high"] - df["close"].shift(1))
    low_close_prev = abs(df["low"] - df["close"].shift(1))
    true_range = pd.concat([high_low, high_close_prev, low_close_prev], axis=1).max(axis=1)
    df["atr"] = true_range.rolling(window=14).mean()
    df["natr"] = (df["atr"] / df["close"]) * 100
    df["dpo"] = df["close"].shift(11) - df["close"].rolling(window=21).mean().shift(1)
    df["dpo"] = df["dpo"].fillna(0)

    df["volatility"] = df["close"].rolling(window=10).std()
    df["momentum"] = (df["close"] - df["close"].shift(5)).fillna(0)

    window_length = 14
    delta = df["close"].diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ma_up = up.rolling(window=window_length, min_periods=1).mean()
    ma_down = down.rolling(window=window_length, min_periods=1).mean()
    rs = ma_up / (ma_down + 1e-6)
    df["rsi"] = 100 - (100 / (1 + rs))

    ema12 = df["close"].ewm(span=12, adjust=False).mean()
    ema26 = df["close"].ewm(span=26, adjust=False).mean()
    df["macd"] = ema12 - ema26
    df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()

    ma20 = df["close"].rolling(window=20).mean()
    std20 = df["close"].rolling(window=20).std()
    df["boll_upper"] = ma20 + 2 * std20
    df["boll_lower"] = ma20 - 2 * std20

    total_rows = len(df)
    train_end = int(0.7 * total_rows)
    val_end = int(0.85 * total_rows)
    train_df = df.iloc[:train_end].copy()
    val_df = df.iloc[train_end:val_end].copy()
    test_df = df.iloc[val_end:].copy()

    min_max_scaler = {}
    for feature in FEATURES_TO_NORMALIZE:
        if feature not in train_df.columns:
            continue
        min_val = train_df[feature].min()
        max_val = train_df[feature].max()
        min_max_scaler[feature] = (min_val, max_val)
        if min_val == max_val:
            train_df[feature] = 0
            val_df[feature] = 0
            test_df[feature] = 0
        else:
            train_df[feature] = (train_df[feature] - min_val) / (max_val - min_val)
            val_df[feature] = (val_df[feature] - min_val) / (max_val - min_val)
            test_df[feature] = (test_df[feature] - min_val) / (max_val - min_val)

    train_df = train_df.fillna(train_df.median())
    val_df = val_df.fillna(val_df.median())
    test_df = test_df.fillna(test_df.median())

    logger.info(f"CSV preprocess: Train {train_df.shape}, Val {val_df.shape}, Test {test_df.shape}")
    return train_df, val_df, test_df
