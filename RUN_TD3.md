# Run TD3 and see output in the frontend

## What happened before

The earlier “Run” failed with **exit code 139** (often a segfault). That can be due to:

- Running inside a restricted/sandbox environment
- PyTorch/numpy and system libraries (e.g. MKL) not matching
- Running without a proper Python environment

So the run is done via a **local backend** that you start on your machine. The frontend then triggers the run and shows the output on the page.

## How to run and see output on the frontend

### 1. Backend (run TD3)

```bash
# From project root (folder that contains td3/, frontend/, CSV file/, server.py)
pip install -r requirements-server.txt
python server.py
```

Leave this running. You should see: `TD3 backend: http://127.0.0.1:5001` (uses port 5001 to avoid conflict with macOS AirPlay on 5000).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:8080** (or the URL Vite prints).

### 3. On the page

- If there are no results yet: click **“Run TD3 model”**. The backend will run the CSV through TD3 and the page will show:
  - **Run output** – log from the script
  - Then **charts and metrics** (OHLC, portfolio value, actions, Sharpe, return %, etc.)
- If results already exist: you’ll see the charts and a **“Run again”** button. Click it to re-run and see the new run output and results.

The frontend talks to the backend via **`/api/td3-results`** and **`/api/run-td3`**. In dev, Vite proxies `/api` to `http://127.0.0.1:5001`, so you don’t need to set `VITE_API_URL`.

## Optional: run TD3 only from the command line

If you only want to run the model (no “Run” button on the page):

```bash
cd td3
pip install -r requirements.txt
python run_csv.py --episodes 10
```

This writes `frontend/public/td3_results.json`. Refresh the frontend to see the new results (no backend needed for viewing).
