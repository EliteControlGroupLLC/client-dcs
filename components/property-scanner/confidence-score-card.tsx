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
        color: "text-emerald-300",
        bg: "bg-emerald-500/10",
        border: "border-emerald-400/30",
        barColor: "bg-primary",
        icon: ShieldCheck,
      };
    case "moderate":
      return {
        label: "Moderate Confidence",
        color: "text-amber-200",
        bg: "bg-amber-500/10",
        border: "border-amber-400/30",
        barColor: "bg-amber-500",
        icon: Info,
      };
    case "low":
      return {
        label: "Low Confidence",
        color: "text-red-300",
        bg: "bg-red-500/10",
        border: "border-red-400/30",
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
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6 animate-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Analysis Confidence</h3>
        </div>
        <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${config.bg} ${config.color}`}>
          {score}/100
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${config.barColor}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mt-1.5">
          <span className={`text-xs font-medium whitespace-nowrap ${config.color}`}>{config.label}</span>
          <span className="text-xs text-white/75">
            {band === "high" && "Data quality supports reliable preliminary analysis"}
            {band === "moderate" && "Professional review recommended to confirm findings"}
            {band === "low" && "Insufficient data for confident analysis"}
          </span>
        </div>
      </div>

      {/* Manual review warning */}
      {manualReviewRequired && (
        <div className="flex items-start gap-2 py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-400/30 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-300 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-200">Professional Review Recommended</p>
            {manualReviewReasons.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {manualReviewReasons.map((reason, i) => (
                  <li key={i} className="text-xs text-amber-200">
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
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between min-h-11 py-2 text-sm text-white/75 hover:text-white transition-colors"
      >
        <span>View confidence signals</span>
        {showDetails ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {showDetails && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          {signals.positive.length > 0 && (
            <div>
              <p className="text-xs font-medium text-emerald-300 mb-1">Positive Signals</p>
              <div className="space-y-1">
                {signals.positive.map((signal, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {signal}
                  </div>
                ))}
              </div>
            </div>
          )}
          {signals.negative.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-300 mb-1">Negative Signals</p>
              <div className="space-y-1">
                {signals.negative.map((signal, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
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
