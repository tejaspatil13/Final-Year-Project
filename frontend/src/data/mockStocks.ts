export interface Stock {
  name: string;
  ticker: string;
  exchange: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number;
  high52: number;
  low52: number;
  volume: string;
  sector: string;
  prediction: {
    nextDay: number;
    next7Days: number;
    next30Days: number;
    confidence: number;
    trend: "Bullish" | "Bearish";
    riskLevel: "Low" | "Medium" | "High";
    recommendation: "Buy" | "Hold" | "Sell";
  };
  insights: {
    buyReasons: string[];
    sellReasons: string[];
    rsi: number;
    macd: string;
    movingAvg: string;
    sentiment: "Positive" | "Neutral" | "Negative";
    sentimentScore: number;
  };
  historicalData: { date: string; price: number; predicted?: number }[];
}

function generateHistorical(basePrice: number, days: number): { date: string; price: number; predicted?: number }[] {
  const data: { date: string; price: number; predicted?: number }[] = [];
  let price = basePrice * 0.85;
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    price += (Math.random() - 0.48) * (basePrice * 0.015);
    price = Math.max(price, basePrice * 0.6);
    const predicted = i < 30 ? price * (1 + (Math.random() - 0.45) * 0.03) : undefined;
    data.push({
      date: d.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
      predicted: predicted ? Math.round(predicted * 100) / 100 : undefined,
    });
  }
  return data;
}

export const stocks: Record<string, Stock> = {
  "TCS": {
    name: "Tata Consultancy Services",
    ticker: "TCS",
    exchange: "NSE",
    currentPrice: 3842.50,
    change: 47.30,
    changePercent: 1.25,
    marketCap: "₹14.08T",
    peRatio: 31.2,
    high52: 4256.80,
    low52: 3056.40,
    volume: "2.4M",
    sector: "Information Technology",
    prediction: {
      nextDay: 3878.20,
      next7Days: 3925.60,
      next30Days: 4012.40,
      confidence: 82,
      trend: "Bullish",
      riskLevel: "Low",
      recommendation: "Buy",
    },
    insights: {
      buyReasons: [
        "Strong quarterly earnings beat expectations by 8%",
        "Consistent dividend payout with 4.2% yield",
        "Digital transformation deals pipeline at all-time high",
      ],
      sellReasons: [
        "Valuation stretched at 31x P/E vs industry avg 25x",
        "Rupee appreciation may impact export revenue",
      ],
      rsi: 58,
      macd: "Bullish crossover",
      movingAvg: "Above 50-day and 200-day MA",
      sentiment: "Positive",
      sentimentScore: 78,
    },
    historicalData: generateHistorical(3842, 365),
  },
  "INFY": {
    name: "Infosys Limited",
    ticker: "INFY",
    exchange: "NSE",
    currentPrice: 1587.40,
    change: -12.80,
    changePercent: -0.80,
    marketCap: "₹6.59T",
    peRatio: 27.8,
    high52: 1953.70,
    low52: 1358.20,
    volume: "5.1M",
    sector: "Information Technology",
    prediction: {
      nextDay: 1579.20,
      next7Days: 1565.80,
      next30Days: 1612.30,
      confidence: 74,
      trend: "Bearish",
      riskLevel: "Medium",
      recommendation: "Hold",
    },
    insights: {
      buyReasons: [
        "Strong AI/cloud services growth at 22% YoY",
        "Attractive valuation compared to peers",
      ],
      sellReasons: [
        "Guidance cut for FY25 revenue growth",
        "Key client concentration risk (top 10 = 35% revenue)",
        "Attrition rising in key verticals",
      ],
      rsi: 42,
      macd: "Bearish divergence",
      movingAvg: "Below 50-day MA, above 200-day MA",
      sentiment: "Neutral",
      sentimentScore: 52,
    },
    historicalData: generateHistorical(1587, 365),
  },
  "RELIANCE": {
    name: "Reliance Industries",
    ticker: "RELIANCE",
    exchange: "NSE",
    currentPrice: 2934.70,
    change: 65.20,
    changePercent: 2.27,
    marketCap: "₹19.86T",
    peRatio: 28.5,
    high52: 3217.60,
    low52: 2221.80,
    volume: "8.7M",
    sector: "Conglomerate",
    prediction: {
      nextDay: 2968.40,
      next7Days: 3015.80,
      next30Days: 3120.50,
      confidence: 88,
      trend: "Bullish",
      riskLevel: "Low",
      recommendation: "Buy",
    },
    insights: {
      buyReasons: [
        "Jio Platforms subscriber growth exceeding targets",
        "New energy segment attracting global partnerships",
        "Retail business scaling to 18,000+ stores",
      ],
      sellReasons: [
        "Oil-to-chemicals margin pressure expected",
        "High capex cycle may strain free cash flows",
      ],
      rsi: 67,
      macd: "Strong bullish momentum",
      movingAvg: "Above all key moving averages",
      sentiment: "Positive",
      sentimentScore: 85,
    },
    historicalData: generateHistorical(2934, 365),
  },
  "AAPL": {
    name: "Apple Inc.",
    ticker: "AAPL",
    exchange: "NASDAQ",
    currentPrice: 198.45,
    change: 3.28,
    changePercent: 1.68,
    marketCap: "$3.05T",
    peRatio: 32.1,
    high52: 215.38,
    low52: 164.08,
    volume: "52.3M",
    sector: "Technology",
    prediction: {
      nextDay: 200.12,
      next7Days: 203.80,
      next30Days: 212.50,
      confidence: 85,
      trend: "Bullish",
      riskLevel: "Low",
      recommendation: "Buy",
    },
    insights: {
      buyReasons: [
        "Vision Pro creating new revenue stream",
        "Services revenue growing at 16% YoY",
        "Record installed base of 2.2B active devices",
      ],
      sellReasons: [
        "iPhone sales growth slowing in key markets",
        "Regulatory headwinds in EU and China",
      ],
      rsi: 62,
      macd: "Bullish crossover forming",
      movingAvg: "Above 50-day and 200-day MA",
      sentiment: "Positive",
      sentimentScore: 81,
    },
    historicalData: generateHistorical(198, 365),
  },
};

export const stockList = Object.values(stocks);

export const trendingStocks = [
  { ticker: "TCS", price: 3842.50, change: 1.25 },
  { ticker: "RELIANCE", price: 2934.70, change: 2.27 },
  { ticker: "INFY", price: 1587.40, change: -0.80 },
  { ticker: "HDFC", price: 1654.20, change: 0.45 },
  { ticker: "WIPRO", price: 487.30, change: -1.12 },
];
