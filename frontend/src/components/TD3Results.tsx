import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
  ReferenceLine,
} from "recharts";
import CandlestickChart from "@/components/CandlestickChart";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  Target,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Gauge,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchTD3Results, runTD3Model, type TD3Results } from "@/data/td3Results";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

function RunOutput({ log, error }: { log: string[]; error?: string }) {
  if (log.length === 0 && !error) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden rounded-xl p-4"
    >
      <div className="mb-2 flex items-center gap-2 font-medium">
        <Terminal className="h-4 w-4 text-primary" />
        Run output
      </div>
      {error && (
        <p className="mb-2 text-sm font-medium text-destructive">{error}</p>
      )}
      <ScrollArea className="h-[200px] w-full rounded-md border border-border bg-secondary/30 p-3 font-mono text-xs">
        <pre className="whitespace-pre-wrap break-all">
          {log.length ? log.join("\n") : "(no output)"}
        </pre>
      </ScrollArea>
    </motion.div>
  );
}

function TD3Charts({
  data,
  onRunAgain,
  isRunning,
}: {
  data: TD3Results;
  onRunAgain?: () => void;
  isRunning?: boolean;
}) {
  const { metrics, ohlc, portfolioHistory, actions, positions } = data;

  const portfolioChartData = portfolioHistory.map((value, i) => ({
    index: i,
    date: ohlc[i]?.date ? new Date(ohlc[i].date).toLocaleDateString("en", { month: "short", day: "numeric" }) : `${i}`,
    value: value,
  }));

  const actionChartData = actions.map((a, i) => ({
    index: i,
    date: ohlc[i]?.date ? new Date(ohlc[i].date).toLocaleDateString("en", { month: "short", day: "numeric" }) : `${i}`,
    action: a,
    position: positions[i] ?? 0,
  }));

  const metricCards = [
    {
      label: "Sharpe Ratio",
      value: metrics.sharpeRatio.toFixed(3),
      icon: Target,
      color: "text-chart-accent",
    },
    {
      label: "Return %",
      value: `${metrics.returnPct >= 0 ? "+" : ""}${metrics.returnPct}%`,
      icon: metrics.returnPct >= 0 ? TrendingUp : TrendingDown,
      color: metrics.returnPct >= 0 ? "text-gain" : "text-loss",
    },
    {
      label: "Max Drawdown %",
      value: `${metrics.maxDrawdownPct}%`,
      icon: AlertTriangle,
      color: "text-warn",
    },
    {
      label: "Final Portfolio Value",
      value: metrics.finalPortfolioValue.toFixed(4),
      icon: Wallet,
      color: "text-primary",
    },
    ...(metrics.directionAccuracyPct != null
      ? [{
          label: "Direction Accuracy",
          value: `${metrics.directionAccuracyPct.toFixed(1)}%`,
          icon: Gauge,
          color: metrics.directionAccuracyPct >= 50 ? "text-gain" : "text-loss",
        }]
      : []),
  ];

  const chartPanelClass = "rounded-lg border border-[#30363d] bg-[#0d1117] overflow-hidden";
  const chartLabelClass = "text-[11px] font-medium text-[#8b949e] font-mono";
  const tooltipStyle = {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "4px",
    padding: "8px 12px",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "12px",
  };

  return (
    <section className="container mx-auto space-y-6 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-[#238636]" />
          <div>
            <h2 className="text-2xl font-bold text-white">TD3 Model Output</h2>
            <p className="text-sm text-[#8b949e]">
              AAPL · TD3 trading agent results
            </p>
          </div>
        </div>
        {onRunAgain && (
          <Button onClick={onRunAgain} disabled={isRunning} variant="outline" className="gap-2 border-[#30363d] bg-[#161b22] text-[#c9d1d9] hover:bg-[#21262d]">
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Terminal className="h-4 w-4" />}
            {isRunning ? "Running… (1–3 min)" : "Run again"}
          </Button>
        )}
      </motion.div>

      {/* Metrics — trading style strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`grid grid-cols-2 gap-3 md:grid-cols-5 ${chartPanelClass} p-4`}
      >
        {metricCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center justify-between rounded border border-[#21262d] bg-[#161b22] px-4 py-3">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color === "text-gain" ? "text-[#3fb950]" : color === "text-loss" ? "text-[#f85149]" : color === "text-warn" ? "text-[#d29922]" : "text-[#58a6ff]"}`} />
              <span className={chartLabelClass}>{label}</span>
            </div>
            <span className={`font-mono text-lg font-semibold tabular-nums ${
              color === "text-gain" ? "text-[#3fb950]" : color === "text-loss" ? "text-[#f85149]" : color === "text-warn" ? "text-[#d29922]" : "text-[#58a6ff]"
            }`}>
              {value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Candlestick — real trading chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={chartPanelClass}
      >
        <div className="flex items-center justify-between border-b border-[#30363d] px-4 py-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#8b949e]" />
            <span className="font-mono text-sm font-semibold text-[#c9d1d9]">AAPL · Candlestick</span>
          </div>
          <div className="flex gap-4 font-mono text-xs text-[#8b949e]">
            <span><span className="text-[#3fb950]">O</span> Open</span>
            <span><span className="text-[#f85149]">C</span> Close</span>
          </div>
        </div>
        <CandlestickChart data={ohlc} height={380} className="w-full" />
      </motion.div>

      {/* Portfolio value — equity curve */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={chartPanelClass}
      >
        <div className="flex items-center justify-between border-b border-[#30363d] px-4 py-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[#8b949e]" />
            <span className="font-mono text-sm font-semibold text-[#c9d1d9]">Equity Curve · TD3 Strategy</span>
          </div>
          <span className="font-mono text-xs text-[#8b949e]">Normalized (start = 1.0)</span>
        </div>
        <div className="h-[280px] w-full px-2 pb-2 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioChartData} margin={{ top: 12, right: 14, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#238636" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#238636" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8b949e", fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#30363d" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8b949e", fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#30363d" }} tickLine={false} tickFormatter={(v) => v.toFixed(2)} domain={["auto", "auto"]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value.toFixed(4), "Portfolio"]} labelStyle={{ color: "#c9d1d9" }} />
              <ReferenceLine y={1} stroke="#30363d" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="value" stroke="#238636" fill="url(#equityGrad)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Position / Action — trading style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={chartPanelClass}
      >
        <div className="flex items-center justify-between border-b border-[#30363d] px-4 py-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[#8b949e]" />
            <span className="font-mono text-sm font-semibold text-[#c9d1d9]">Position & Signal</span>
          </div>
          <div className="flex gap-4 font-mono text-xs text-[#8b949e]">
            <span>Action (raw)</span>
            <span>Position (held)</span>
          </div>
        </div>
        <div className="h-[240px] w-full px-2 pb-2 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={actionChartData} margin={{ top: 12, right: 14, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8b949e", fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#30363d" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8b949e", fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#30363d" }} tickLine={false} domain={[-1.1, 1.1]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#c9d1d9" }} />
              <ReferenceLine y={0} stroke="#30363d" strokeDasharray="2 2" />
              <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: "11px" }} />
              <Line type="monotone" dataKey="action" stroke="#a371f7" strokeWidth={2} dot={false} name="Action" isAnimationActive={false} />
              <Line type="monotone" dataKey="position" stroke="#58a6ff" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Position" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </section>
  );
}

function TD3Empty({
  refetch,
  onRun,
  isRunning,
  runLog,
  runError,
}: {
  refetch: () => void;
  onRun: () => void;
  isRunning: boolean;
  runLog: string[];
  runError?: string;
}) {
  return (
    <section className="container mx-auto space-y-6 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex flex-col items-center justify-center gap-6 rounded-xl p-12 text-center"
      >
        <Brain className="h-16 w-16 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-bold">No TD3 results yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Run the CSV through the TD3 model below. The backend will train the model and show the output on this page.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={onRun}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running… (1–3 min)
              </>
            ) : (
              <>
                <Terminal className="h-4 w-4" />
                Run TD3 model
              </>
            )}
          </Button>
          {isRunning && (
            <p className="w-full text-center text-sm text-muted-foreground">
              Training TD3 on CSV — results and log will appear when done.
            </p>
          )}
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Check again
          </Button>
        </div>
      </motion.div>
      {runLog.length > 0 || runError ? (
        <RunOutput log={runLog} error={runError} />
      ) : null}
    </section>
  );
}

export default function TD3Results() {
  const queryClient = useQueryClient();
  const [runLog, setRunLog] = useState<string[]>([]);
  const [runError, setRunError] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["td3-results"],
    queryFn: fetchTD3Results,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const handleRun = async () => {
    setIsRunning(true);
    setRunError(undefined);
    setRunLog([]);
    try {
      const out = await runTD3Model(3);
      setRunLog(out.log || []);
      if (!out.success) {
        setRunError(out.error || "Run failed");
      } else if (out.results) {
        queryClient.setQueryData(["td3-results"], out.results);
      } else {
        refetch();
      }
    } catch (e) {
      setRunError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <section className="container mx-auto space-y-8 px-4 py-10">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] w-full rounded-xl" />
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <TD3Empty
        refetch={refetch}
        onRun={handleRun}
        isRunning={isRunning}
        runLog={runLog}
        runError={runError}
      />
    );
  }

  return (
    <>
      {runLog.length > 0 || runError ? (
        <section className="container mx-auto px-4 pt-6">
          <RunOutput log={runLog} error={runError} />
        </section>
      ) : null}
      <TD3Charts data={data} onRunAgain={handleRun} isRunning={isRunning} />
    </>
  );
}
