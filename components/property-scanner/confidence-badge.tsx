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
    bg: "bg-primary/5",
    text: "text-primary",
    border: "border-primary/20",
  },
  "Cross-checked": {
    icon: RefreshCw,
    bg: "bg-primary-light/10",
    text: "text-secondary-light",
    border: "border-primary-light/40",
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
        className={`relative inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap cursor-help before:absolute before:-inset-x-1 before:-inset-y-[11px] before:content-[''] ${c.bg} ${c.text} ${c.border} ${
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs"
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
            <span className="text-xs tabular-nums text-muted-foreground">
              {confidence}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mb-2">
            <div
              className={`h-1.5 rounded-full transition-all ${
                confidence >= 90
                  ? "bg-primary"
                  : confidence >= 75
                  ? "bg-primary-light"
                  : confidence >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
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
