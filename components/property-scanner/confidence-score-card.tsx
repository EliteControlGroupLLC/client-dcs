"use client";

import { ShieldCheck, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ConfidenceScoreCardProps {
  score: number;
  band: "high" | "moderate" | "low";
  manualReviewRequired: boolean;
  manualReviewReasons: string[];
  signals: {
    positive: string[];
    negative: string[];
  };
}

function getBandConfig(band: "high" | "moderate" | "low") {
  switch (band) {
    case "high":
      return {
        label: "High Confidence",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        barColor: "bg-emerald-500",
        icon: ShieldCheck,
      };
    case "moderate":
      return {
        label: "Moderate Confidence",
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        barColor: "bg-amber-500",
        icon: Info,
      };
    case "low":
      return {
        label: "Low Confidence",
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        barColor: "bg-red-500",
        icon: AlertTriangle,
      };
  }
}

export function ConfidenceScoreCard({
  score,
  band,
  manualReviewRequired,
  manualReviewReasons,
  signals,
}: ConfidenceScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const config = getBandConfig(band);
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <h3 className="text-lg font-bold text-secondary">Analysis Confidence</h3>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
          {score}/100
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${config.barColor}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          <span className="text-[10px] text-muted-foreground">
            {band === "high" && "Data quality supports reliable preliminary analysis"}
            {band === "moderate" && "Professional review recommended to confirm findings"}
            {band === "low" && "Insufficient data for confident analysis"}
          </span>
        </div>
      </div>

      {/* Manual review warning */}
      {manualReviewRequired && (
        <div className="flex items-start gap-2 py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-800">Professional Review Recommended</p>
            {manualReviewReasons.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {manualReviewReasons.map((reason, i) => (
                  <li key={i} className="text-[10px] text-amber-700">
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Expandable signals */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between py-2 text-xs text-muted-foreground hover:text-secondary transition-colors"
      >
        <span>View confidence signals</span>
        {showDetails ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {showDetails && (
        <div className="space-y-3 pt-2 border-t border-border/50">
          {signals.positive.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-emerald-600 mb-1">Positive Signals</p>
              <div className="space-y-1">
                {signals.positive.map((signal, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {signal}
                  </div>
                ))}
              </div>
            </div>
          )}
          {signals.negative.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-red-600 mb-1">Negative Signals</p>
              <div className="space-y-1">
                {signals.negative.map((signal, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-red-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {signal}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
