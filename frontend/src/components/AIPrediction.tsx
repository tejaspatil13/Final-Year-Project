import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, TrendingDown, ShieldAlert, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import type { Stock } from "@/data/mockStocks";
import { useQuery } from "@tanstack/react-query";
import { fetchTD3Results } from "@/data/td3Results";

interface AIPredictionProps {
  stock: Stock;
}

const AIPrediction = ({ stock }: AIPredictionProps) => {
  const p = stock.prediction;
  const currency = stock.exchange === "NASDAQ" ? "$" : "₹";

  const { data: td3 } = useQuery({
    queryKey: ["td3-results"],
    queryFn: fetchTD3Results,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const isAAPL = stock.ticker === "AAPL";
  const td3m = td3?.metrics;

  const recIcon = p.recommendation === "Buy" ? ThumbsUp : p.recommendation === "Hold" ? Minus : ThumbsDown;
  const recColor = p.recommendation === "Buy" ? "text-gain bg-gain/10" : p.recommendation === "Hold" ? "text-warn bg-warn/10" : "text-loss bg-loss/10";

  const predictions = [
    { label: "Next Day", value: p.nextDay },
    { label: "7 Days", value: p.next7Days },
    { label: "30 Days", value: p.next30Days },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">AI Prediction</h3>
      </div>

      {/* Predicted prices */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {predictions.map(({ label, value }) => {
          const diff = ((value - stock.currentPrice) / stock.currentPrice) * 100;
          const positive = diff >= 0;
          return (
            <div key={label} className="rounded-lg bg-secondary/50 p-4 text-center">
              <div className="stat-label mb-1">{label}</div>
              <div className="text-xl font-bold font-mono">
                {currency}{value.toLocaleString()}
              </div>
              <div className={`text-xs font-semibold ${positive ? "text-gain" : "text-loss"}`}>
                {positive ? "+" : ""}{diff.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Confidence */}
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="stat-label mb-2">Confidence</div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-chart-accent" />
            <span className="text-lg font-bold">{p.confidence}%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-accent transition-all duration-700"
              style={{ width: `${p.confidence}%` }}
            />
          </div>
        </div>

        {/* Trend */}
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="stat-label mb-2">Trend</div>
          <div className={`flex items-center gap-2 ${p.trend === "Bullish" ? "text-gain" : "text-loss"}`}>
            {p.trend === "Bullish" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="text-lg font-bold">{p.trend}</span>
          </div>
        </div>

        {/* Risk */}
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="stat-label mb-2">Risk Level</div>
          <div className="flex items-center gap-2">
            <ShieldAlert className={`h-4 w-4 ${p.riskLevel === "Low" ? "text-gain" : p.riskLevel === "Medium" ? "text-warn" : "text-loss"}`} />
            <span className="text-lg font-bold">{p.riskLevel}</span>
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="stat-label mb-2">Action</div>
          <div className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-bold ${recColor}`}>
            {(() => { const Icon = recIcon; return <Icon className="h-4 w-4" />; })()}
            {p.recommendation}
          </div>
        </div>
      </div>

      {/* TD3 trading model summary for AAPL */}
      {isAAPL && td3m && (
        <div className="mt-6 rounded-lg bg-secondary/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Brain className="h-4 w-4 text-chart-accent" />
            <span>TD3 Trading Model (test period)</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-mono">
            <div>
              <div className="text-muted-foreground">Return</div>
              <div className={td3m.returnPct >= 0 ? "text-gain font-semibold" : "text-loss font-semibold"}>
                {td3m.returnPct.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Sharpe</div>
              <div className="font-semibold">{td3m.sharpeRatio.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Max Drawdown</div>
              <div className="font-semibold">{td3m.maxDrawdownPct.toFixed(2)}%</div>
            </div>
            {td3m.directionAccuracyPct != null && (
              <div>
                <div className="text-muted-foreground">Direction Accuracy</div>
                <div className={td3m.directionAccuracyPct >= 50 ? "text-gain font-semibold" : "text-loss font-semibold"}>
                  {td3m.directionAccuracyPct.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Shows how the TD3 reinforcement learning trading agent performed on recent AAPL data.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AIPrediction;
