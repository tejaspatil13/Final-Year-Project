import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { BarChart3 } from "lucide-react";
import type { Stock } from "@/data/mockStocks";

interface StockChartProps {
  stock: Stock;
}

const timeFilters = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

const StockChart = ({ stock }: StockChartProps) => {
  const [range, setRange] = useState(90);
  const [chartType, setChartType] = useState<"area" | "line">("area");

  const data = useMemo(() => {
    const sliced = stock.historicalData.slice(-range);
    // Thin out data for performance
    const step = Math.max(1, Math.floor(sliced.length / 80));
    return sliced.filter((_, i) => i % step === 0 || i === sliced.length - 1);
  }, [stock, range]);

  const currency = stock.exchange === "NASDAQ" ? "$" : "₹";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-xl text-xs">
        <div className="mb-1.5 font-medium text-muted-foreground">{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.dataKey === "price" ? "Actual" : "Predicted"}:</span>
            <span className="font-mono font-semibold">{currency}{p.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Price Chart</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart type toggle */}
          <div className="flex rounded-lg border border-border bg-secondary/50 p-0.5">
            {(["area", "line"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  chartType === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Time range */}
          <div className="flex rounded-lg border border-border bg-secondary/50 p-0.5">
            {timeFilters.map((f) => (
              <button
                key={f.label}
                onClick={() => setRange(f.days)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === f.days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(215 12% 50%)" }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return range <= 30 ? d.toLocaleDateString("en", { day: "numeric", month: "short" }) : d.toLocaleDateString("en", { month: "short", year: "2-digit" });
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(215 12% 50%)" }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `${currency}${v.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {chartType === "area" ? (
              <>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160 84% 44%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(160 84% 44%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(280 70% 60%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(280 70% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="price" stroke="hsl(160 84% 44%)" fill="url(#priceGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="predicted" stroke="hsl(280 70% 60%)" fill="url(#predGrad)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="price" stroke="hsl(160 84% 44%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="predicted" stroke="hsl(280 70% 60%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded-full bg-gain" />
          Historical Price
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded-full bg-chart-predicted" style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(280 70% 60%) 0 5px, transparent 5px 10px)" }} />
          Predicted Price
        </div>
      </div>
    </motion.div>
  );
};

export default StockChart;
