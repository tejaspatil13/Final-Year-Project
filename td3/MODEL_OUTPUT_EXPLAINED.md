# TD3 Model Output — What Everything Means (Easy Language)

**What is the "accuracy" of the model?**  
TD3 is a trading agent (it chooses how much to buy/sell), not a classifier that predicts "up" or "down". So we don't have a single "accuracy" like in image classification. Instead we report **Direction Accuracy %**: how often the model was on the right side of the market (long when price went up, short when price went down). 50% = random; above 50% = better than a coin flip.

When the model runs, it prints a summary in the terminal. Here is what each part means.

---

## 1. Return % (returnPct)

- **What it is:** How much your money went up or down over the test period (in percent).
- **In simple words:** If you started with 100, +10% means you have 110; -5% means you have 95.
- **Your number:** Shown as e.g. `+12.50%` or `-3.20%`.

---

## 2. Sharpe Ratio (sharpeRatio)

- **What it is:** “Return per unit of risk”. Higher = better reward for the risk taken.
- **In simple words:**  
  - **Above 1** → decent (you’re getting more return than the risk you take).  
  - **Above 2** → very good.  
  - **Below 0** → you’re losing money on average.
- **Your number:** Something like `0.85` or `1.42`.

---

## 3. Max Drawdown % (maxDrawdownPct)

- **What it is:** The biggest drop from a previous high to a low (in percent).
- **In simple words:** “Worst dip”. If your portfolio went 100 → 120 → 100, the drop from 120 to 100 is about 16.7% drawdown.
- **Your number:** e.g. `8.50%` means at worst you were 8.5% below a prior peak.

---

## 4. Final Portfolio Value (finalPortfolioValue)

- **What it is:** The value of the strategy at the end of the test. Start is always **1.0**.
- **In simple words:**  
  - **1.05** = 5% profit.  
  - **0.95** = 5% loss.  
  - **1.00** = no change.
- **Your number:** e.g. `1.0245`.

---

## 5. Direction Accuracy % (directionAccuracyPct) — the "accuracy" of the model

- **What it is:** How often the model’s position matched the next price move (long before up, short before down).
- **In simple words:**  
  - **50%** = like flipping a coin (no edge).  
  - **Above 50%** = the model is right more often than wrong.  
  - **Below 50%** = the model is wrong more often (or doing the opposite of the market).
- **Your number:** e.g. `52.30%` or `48.10%`.

---

## Position & Signal (in the charts)

- **Signal (Action)**  
  The number the model outputs each step, from **-1** to **+1**.  
  - **+1** = model wants to be fully invested (long).  
  - **-1** = model wants to be fully out or short.  
  - **0** = neutral.  
  Values in between = “a bit long” or “a bit short”.

- **Position**  
  How much you actually hold at that time (same scale -1 to +1).  
  Usually the same as the signal; both show how bullish or bearish the model was over time.

---

When you run `python run_csv.py` (or trigger “Run TD3 model” from the frontend), this same summary is printed in the terminal at the end so you can see the model output and every meaning in one place.
