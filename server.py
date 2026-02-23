"""
Backend to run TD3 on CSV and serve results to the frontend.
Start:  python server.py
Then open frontend (npm run dev) and use "Run TD3 model" to run and see output on the page.
"""
import json
import os
import subprocess
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
TD3_DIR = os.path.join(PROJECT_ROOT, "td3")
CSV_PATH = os.path.join(PROJECT_ROOT, "CSV file", "AAPL_data.csv")
RESULTS_JSON = os.path.join(PROJECT_ROOT, "frontend", "public", "td3_results.json")


@app.route("/api/td3-results", methods=["GET"])
def get_td3_results():
    """Return existing TD3 results JSON if present."""
    if not os.path.exists(RESULTS_JSON):
        return jsonify({"error": "No results yet. Run the model first."}), 404
    try:
        with open(RESULTS_JSON) as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/run-td3", methods=["POST"])
def run_td3():
    """Run TD3 on CSV; capture stdout/stderr; return log + results."""
    episodes = 3  # fewer episodes so run finishes in 1-3 min and results show
    body = request.get_json(silent=True) or {}
    if isinstance(body.get("episodes"), int) and 1 <= body["episodes"] <= 100:
        episodes = body["episodes"]

    run_csv = os.path.join(TD3_DIR, "run_csv.py")
    if not os.path.exists(run_csv):
        return jsonify({
            "success": False,
            "log": [f"Not found: {run_csv}"],
            "error": "td3/run_csv.py not found",
        }), 400
    if not os.path.exists(CSV_PATH):
        return jsonify({
            "success": False,
            "log": [],
            "error": f"CSV not found: {CSV_PATH}",
        }), 400

    try:
        proc = subprocess.run(
            [sys.executable, "run_csv.py", "--episodes", str(episodes)],
            cwd=TD3_DIR,
            capture_output=True,
            text=True,
            timeout=600,
            env={**os.environ, "PYTHONUNBUFFERED": "1"},
        )
        log_lines = []
        if proc.stdout:
            log_lines.extend(proc.stdout.splitlines())
        if proc.stderr:
            log_lines.extend(proc.stderr.splitlines())
        if not log_lines:
            log_lines = [f"Exit code: {proc.returncode}"]

        if proc.returncode != 0:
            return jsonify({
                "success": False,
                "log": log_lines,
                "error": f"Process exited with code {proc.returncode}",
            }), 200

        results = None
        if os.path.exists(RESULTS_JSON):
            with open(RESULTS_JSON) as f:
                results = json.load(f)

        return jsonify({
            "success": True,
            "log": log_lines,
            "results": results,
        })
    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False,
            "log": ["Run timed out (10 min). Try fewer episodes."],
            "error": "Timeout",
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "log": [],
            "error": str(e),
        }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"TD3 backend: http://127.0.0.1:{port}")
    print("  GET  /api/td3-results  - get last results")
    print("  POST /api/run-td3      - run model (body: { episodes?: number })")
    app.run(host="0.0.0.0", port=port, debug=False)
