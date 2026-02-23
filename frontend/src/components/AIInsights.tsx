import { motion } from "framer-motion";
import { Lightbulb, ThumbsUp, ThumbsDown, Activity, Newspaper } from "lucide-react";
import type { Stock } from "@/data/mockStocks";

interface AIInsightsProps {
  stock: Stock;
}

const AIInsights = ({ stock }: AIInsightsProps) => {
  const ins = stock.insights;
  const sentColor = ins.sentiment === "Positive" ? "text-gain" : ins.sentiment === "Negative" ? "text-loss" : "text-warn";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid gap-4 md:grid-cols-2"
    >
      {/* Buy / Sell Reasons */}
      <div className="glass-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">AI Insights</h3>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gain">
            <ThumbsUp className="h-4 w-4" /> Reasons to Buy
          </div>
          <ul className="space-y-1.5">
            {ins.buyReasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gain" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-loss">
            <ThumbsDown className="h-4 w-4" /> Reasons to Sell
          </div>
          <ul className="space-y-1.5">
            {ins.sellReasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-loss" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Technical + Sentiment */}
      <div className="glass-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Technical Indicators</h3>
        </div>

        <div className="space-y-3">
          {[
            { label: "RSI (14)", value: ins.rsi.toString(), note: ins.rsi > 70 ? "Overbought" : ins.rsi < 30 ? "Oversold" : "Neutral" },
            { label: "MACD", value: ins.macd },
            { label: "Moving Avg", value: ins.movingAvg },
          ].map(({ label, value, note }) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="text-right">
                <span className="text-sm font-semibold">{value}</span>
                {note && <span className="ml-2 text-xs text-muted-foreground">({note})</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Sentiment */}
        <div className="mt-5 rounded-lg bg-secondary/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-chart-accent" />
            <span className="text-sm font-semibold">News Sentiment</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${sentColor}`}>{ins.sentiment}</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    ins.sentiment === "Positive" ? "bg-gain" : ins.sentiment === "Negative" ? "bg-loss" : "bg-warn"
                  }`}
                  style={{ width: `${ins.sentimentScore}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{ins.sentimentScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIInsights;
