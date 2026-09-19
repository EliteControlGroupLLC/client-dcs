import { CheckCircle2, AlertCircle, MinusCircle, XCircle } from "lucide-react";

type FeasibilityLevel = "Likely" | "Possible" | "Limited" | "Not Recommended";

interface FeasibilityBadgeProps {
  level: FeasibilityLevel;
  size?: "sm" | "md";
}

const config: Record<FeasibilityLevel, { icon: typeof CheckCircle2; bg: string; text: string; border: string }> = {
  Likely: {
    icon: CheckCircle2,
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-400/30",
  },
  Possible: {
    icon: AlertCircle,
    bg: "bg-white/5",
    text: "text-white/80",
    border: "border-white/20",
  },
  Limited: {
    icon: MinusCircle,
    bg: "bg-amber-500/10",
    text: "text-amber-200",
    border: "border-amber-400/30",
  },
  "Not Recommended": {
    icon: XCircle,
    bg: "bg-red-500/10",
    text: "text-red-300",
    border: "border-red-400/30",
  },
};

export function FeasibilityBadge({ level, size = "md" }: FeasibilityBadgeProps) {
  const c = config[level];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${c.bg} ${c.text} ${c.border} ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {level}
    </span>
  );
}
