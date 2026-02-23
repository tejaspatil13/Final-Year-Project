import { useState } from "react";
import { Search, ChevronDown, TrendingUp, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { trendingStocks } from "@/data/mockStocks";

interface HeroSectionProps {
  onSearch: (ticker: string) => void;
}

const exchanges = ["NSE", "BSE", "NASDAQ"];

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [query, setQuery] = useState("");
  const [exchange, setExchange] = useState("NSE");
  const [exchangeOpen, setExchangeOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim().toUpperCase());
  };

  return (
    <section className="relative overflow-hidden gradient-hero grid-pattern">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            Powered by Advanced Machine Learning
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            AI-Powered Stock{" "}
            <span className="gradient-text">Market Predictions</span>
          </h1>

          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            Smart insights powered by Machine Learning — get real-time predictions,
            technical analysis, and actionable recommendations.
          </p>

          {/* Search */}
          <form onSubmit={handleSubmit} className="mx-auto mb-8 max-w-2xl">
            <div className="glass-card flex items-center gap-0 p-1.5">
              {/* Exchange dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExchangeOpen(!exchangeOpen)}
                  className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  {exchange}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                {exchangeOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-28 rounded-lg border border-border bg-popover p-1 shadow-xl">
                    {exchanges.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => { setExchange(ex); setExchangeOpen(false); }}
                        className="w-full rounded-md px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-secondary"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search stock (e.g., TCS, INFY, RELIANCE, AAPL)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <Button type="submit" size="sm" className="shrink-0 px-5">
                Predict
              </Button>
            </div>
          </form>

          {/* Quick picks */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Trending:</span>
            {trendingStocks.map((s) => (
              <button
                key={s.ticker}
                onClick={() => onSearch(s.ticker)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/30 hover:bg-secondary"
              >
                <span className="font-mono">{s.ticker}</span>
                <span className={s.change >= 0 ? "text-gain" : "text-loss"}>
                  {s.change >= 0 ? "+" : ""}{s.change}%
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4"
        >
          {[
            { icon: TrendingUp, label: "Predictions Made", value: "2.4M+" },
            { icon: Zap, label: "Avg Accuracy", value: "84.7%" },
            { icon: Shield, label: "Active Users", value: "150K+" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass-card p-4 text-center">
              <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
