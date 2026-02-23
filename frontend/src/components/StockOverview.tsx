import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Building2, BarChart3 } from "lucide-react";
import type { Stock } from "@/data/mockStocks";

interface StockOverviewProps {
  stock: Stock;
}

const StockOverview = ({ stock }: StockOverviewProps) => {
  const isPositive = stock.change >= 0;

  const stats = [
    { label: "Market Cap", value: stock.marketCap },
    { label: "P/E Ratio", value: stock.peRatio.toFixed(1) },
    { label: "52W High", value: stock.high52.toLocaleString() },
    { label: "52W Low", value: stock.low52.toLocaleString() },
    { label: "Volume", value: stock.volume },
    { label: "Sector", value: stock.sector },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h2 className="text-2xl font-bold">{stock.name}</h2>
            <span className="ticker-badge">{stock.ticker}</span>
            <span className="ticker-badge">{stock.exchange}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            {stock.sector}
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold font-mono">
            {stock.exchange === "NASDAQ" ? "$" : "₹"}{stock.currentPrice.toLocaleString()}
          </div>
          <div className={`flex items-center justify-end gap-1 text-sm font-semibold ${isPositive ? "text-gain" : "text-loss"}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-secondary/50 p-3">
            <div className="stat-label">{label}</div>
            <div className="mt-1 text-sm font-semibold">{value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default StockOverview;
