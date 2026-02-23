import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, type IChartApi } from "lightweight-charts";

export interface OHLCItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: OHLCItem[];
  height?: number;
  className?: string;
}

const TRADING_THEME = {
  layout: {
    background: { type: "solid" as const, color: "#0d1117" },
    textColor: "#8b949e",
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: "#21262d" },
    horzLines: { color: "#21262d" },
  },
  crosshair: {
    vertLine: { labelBackgroundColor: "#238636" },
    horzLine: { labelBackgroundColor: "#238636" },
  },
  rightPriceScale: {
    borderColor: "#30363d",
    scaleMargins: { top: 0.05, bottom: 0.05 },
    textColor: "#8b949e",
  },
  timeScale: {
    borderColor: "#30363d",
    timeVisible: true,
    secondsVisible: false,
  },
};

export default function CandlestickChart({ data, height = 380, className = "" }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const chart = createChart(containerRef.current, {
      ...TRADING_THEME,
      width: containerRef.current.clientWidth,
      height,
      rightPriceScale: {
        ...TRADING_THEME.rightPriceScale,
        borderVisible: true,
      },
      timeScale: {
        ...TRADING_THEME.timeScale,
        borderVisible: true,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#238636",
      downColor: "#da3633",
      borderDownColor: "#da3633",
      borderUpColor: "#238636",
      wickDownColor: "#da3633",
      wickUpColor: "#238636",
    });

    const chartData = data.map((d) => {
      const t = d.date.slice(0, 10);
      return { time: t, open: d.open, high: d.high, low: d.low, close: d.close };
    });
    candlestickSeries.setData(chartData);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);
    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, height]);

  return <div ref={containerRef} className={className} style={{ height }} />;
}
