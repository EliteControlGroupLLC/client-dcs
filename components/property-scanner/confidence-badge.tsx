import { CheckCircle2, RefreshCw, HelpCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { ConfidenceStatus } from "@/lib/property-intelligence/types";

interface ConfidenceBadgeProps {
  status: ConfidenceStatus;
  confidence: number;
  sources: string[];
  size?: "sm" | "md";
}

const config: Record<ConfidenceStatus, {
  icon: typeof CheckCircle2;
  bg: string;
  text: string;
  border: string;
}> = {
  Verified: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  "Cross-checked": {
    icon: RefreshCw,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Estimated: {
    icon: HelpCircle,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  Unavailable: {
    icon: AlertTriangle,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

export function ConfidenceBadge({ status, confidence, sources, size = "sm" }: ConfidenceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const c = config[status];
  const Icon = c.icon;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`inline-flex items-center gap-1 rounded-full border font-medium cursor-help ${c.bg} ${c.text} ${c.border} ${
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
        {status}
      </button>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-56 bg-white rounded-lg shadow-xl border border-border p-3 text-left animate-fade-in">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold ${c.text}`}>{status}</span>
            <span className="text-xs font-mono text-muted-foreground">
              {confidence}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
            <div
              className={`h-1.5 rounded-full transition-all ${
                confidence >= 90
                  ? "bg-emerald-500"
                  : confidence >= 75
                  ? "bg-blue-500"
                  : confidence >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Confidence reflects how strongly this field was cross-checked across available records and property signals.
          </p>
          <div className="absolute top-full left-4 -mt-px">
            <div className="w-2 h-2 bg-white border-r border-b border-border transform rotate-45 -translate-y-1" />
          </div>
        </div>
      )}
    </div>
  );
}
