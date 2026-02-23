# Run TD3 on CSV and Show Results in Frontend

1. **Install dependencies** (from `td3/`):
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the model** on the AAPL CSV (from **project root**):
   ```bash
   cd td3 && python run_csv.py
   ```
   Or with fewer episodes for a quick run:
   ```bash
   cd td3 && python run_csv.py --episodes 10
   ```
   This will:
   - Load `CSV file/AAPL_data.csv`
   - Preprocess and train TD3
   - Run the best model on the test set
   - Write `frontend/public/td3_results.json`

3. **Start the frontend** (from project root):
   ```bash
   cd frontend && npm run dev
   ```
   Open the app and scroll to **TD3 Model Output**: you’ll see Open/High/Low/Close chart, portfolio value, model actions, and metrics (Sharpe, Return %, Max Drawdown, Final Portfolio Value).

## Options

- `--csv PATH` – path to CSV (default: `CSV file/AAPL_data.csv`)
- `--out PATH` – output JSON path (default: `frontend/public/td3_results.json`)
- `--episodes N` – training episodes (default: 30)
