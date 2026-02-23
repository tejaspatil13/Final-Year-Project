export interface TD3Metrics {
  sharpeRatio: number;
  returnPct: number;
  maxDrawdownPct: number;
  finalPortfolioValue: number;
  directionAccuracyPct?: number;
}

export interface TD3OHLC {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TD3Results {
  metrics: TD3Metrics;
  ohlc: TD3OHLC[];
  portfolioHistory: number[];
  actions: number[];
  positions: number[];
}

const TD3_RESULTS_URL = "/td3_results.json";
const API_BASE = import.meta.env.VITE_API_URL || "";

export async function fetchTD3Results(): Promise<TD3Results | null> {
  const apiUrl = API_BASE ? `${API_BASE}/api/td3-results` : "/api/td3-results";
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      const fallback = await fetch(TD3_RESULTS_URL);
      if (!fallback.ok) return null;
      const data: TD3Results = await fallback.json();
      return data;
    }
    const data: TD3Results = await res.json();
    return data;
  } catch {
    try {
      const res = await fetch(TD3_RESULTS_URL);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}

export interface RunTD3Response {
  success: boolean;
  log: string[];
  results?: TD3Results | null;
  error?: string;
}

export async function runTD3Model(episodes = 3): Promise<RunTD3Response> {
  const apiUrl = API_BASE ? `${API_BASE}/api/run-td3` : "/api/run-td3";
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ episodes }),
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as RunTD3Response;
  } catch {
    return {
      success: false,
      log: [text || `HTTP ${res.status}`],
      error: "Invalid response from server",
    };
  }
}
