import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TD3Results from "@/components/TD3Results";
import StockOverview from "@/components/StockOverview";
import AIPrediction from "@/components/AIPrediction";
import StockChart from "@/components/StockChart";
import AIInsights from "@/components/AIInsights";
import RiskDisclaimer from "@/components/RiskDisclaimer";
import Footer from "@/components/Footer";
import { stocks } from "@/data/mockStocks";
import type { Stock } from "@/data/mockStocks";

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const handleSearch = (ticker: string) => {
    const stock = stocks[ticker];
    if (stock) {
      setSelectedStock(stock);
      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection onSearch={handleSearch} />

      {/* TD3 model output: CSV data run through ML model — charts, open/close, metrics */}
      <TD3Results />

      {selectedStock && (
        <section id="results" className="container mx-auto space-y-6 px-4 py-10">
          <StockOverview stock={selectedStock} />
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <StockChart stock={selectedStock} />
            </div>
            <div className="lg:col-span-2">
              <AIPrediction stock={selectedStock} />
            </div>
          </div>
          <AIInsights stock={selectedStock} />
          <RiskDisclaimer />
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
