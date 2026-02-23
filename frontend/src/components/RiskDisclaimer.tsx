import { AlertTriangle } from "lucide-react";

const RiskDisclaimer = () => (
  <div className="mx-auto max-w-3xl rounded-xl border border-warn/20 bg-warn/5 p-4">
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
      <div>
        <h4 className="mb-1 text-sm font-semibold text-warn">Risk Disclaimer</h4>
        <p className="text-xs leading-relaxed text-muted-foreground">
          This prediction is AI-generated and does not constitute financial advice. Stock market
          investments are subject to market risks. Past performance is not indicative of future
          results. Always consult a certified financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  </div>
);

export default RiskDisclaimer;
