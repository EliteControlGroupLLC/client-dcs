"use client";

import { Shield, Droplets, Flame, Mountain, Waves, Construction } from "lucide-react";

interface SiteConstraint {
  category: "flood" | "fire" | "terrain" | "coastal" | "easement";
  classification: string;
  severity: "none" | "low" | "moderate" | "high" | "very-high";
  constructionImpact: string;
  recommendation: string;
  confidence: number;
  source: string;
}

interface SiteConstraintsData {
  constraints: SiteConstraint[];
  overallRiskLevel: "Low" | "Moderate" | "High";
  overallRiskScore: number;
  costAdjustmentPercent: number;
  timelineAdjustmentMonths: number;
  summary: string;
}

interface SiteConstraintsCardProps {
  data: SiteConstraintsData;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  flood: Droplets,
  fire: Flame,
  terrain: Mountain,
  coastal: Waves,
  easement: Construction,
};

const categoryLabels: Record<string, string> = {
  flood: "Flood Risk",
  fire: "Fire Hazard",
  terrain: "Terrain",
  coastal: "Coastal Zone",
  easement: "Easements",
};

const severityColors: Record<string, { bg: string; text: string; dot: string }> = {
  none: { bg: "bg-primary/5", text: "text-primary", dot: "bg-primary" },
  low: { bg: "bg-primary/5", text: "text-primary", dot: "bg-primary" },
  moderate: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  high: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  "very-high": { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
};

const severityLabels: Record<string, string> = {
  none: "None",
  low: "Low",
  moderate: "Moderate",
  high: "High",
  "very-high": "Very High",
};

const riskLevelStyles: Record<string, { bg: string; text: string; border: string }> = {
  Low: { bg: "bg-primary/5", text: "text-primary", border: "border-primary/20" },
  Moderate: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  High: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

export function SiteConstraintsCard({ data }: SiteConstraintsCardProps) {
  const riskStyle = riskLevelStyles[data.overallRiskLevel] || riskLevelStyles.Low;
  const activeConstraints = data.constraints.filter((c) => c.severity !== "none");

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-secondary">Site Conditions</h3>
            <p className="text-sm text-muted-foreground">
              Environmental &amp; regulatory constraint analysis
            </p>
          </div>
        </div>

        {/* Overall Risk Badge */}
        <div className={`px-3 py-1.5 rounded-full border whitespace-nowrap ${riskStyle.bg} ${riskStyle.border}`}>
          <span className={`text-xs font-semibold ${riskStyle.text}`}>
            {data.overallRiskLevel} Risk
          </span>
        </div>
      </div>

      {/* Constraint Grid */}
      <div className="space-y-2 mb-4">
        {data.constraints.map((constraint) => {
          const Icon = categoryIcons[constraint.category] || Shield;
          // confidence 0 = the map/service couldn't be checked for this parcel
          const notChecked = constraint.confidence === 0;
          const colors = notChecked
            ? { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" }
            : severityColors[constraint.severity] || severityColors.none;
          const label = categoryLabels[constraint.category] || constraint.category;
          const severityLabel = notChecked ? "Not checked" : severityLabels[constraint.severity] || constraint.severity;

          return (
            <div
              key={constraint.category}
              className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-medium text-secondary block">{label}</span>
                  <span className="text-xs text-muted-foreground block">
                    {constraint.classification}
                  </span>
                  {constraint.source && (
                    <span className="text-xs text-muted-foreground/80 block">Source: {constraint.source}</span>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full shrink-0 ${colors.bg}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                <span className={`text-xs font-medium ${colors.text}`}>
                  {severityLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Summary */}
      {(data.costAdjustmentPercent > 0 || data.timelineAdjustmentMonths > 0) && (
        <div className="bg-amber-50/50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs font-medium text-amber-800 mb-1">Estimated Impact (planning estimate)</p>
          <div className="flex gap-4">
            {data.costAdjustmentPercent > 0 && (
              <span className="text-xs text-amber-700">
                +{data.costAdjustmentPercent}% est. cost increase
              </span>
            )}
            {data.timelineAdjustmentMonths > 0 && (
              <span className="text-xs text-amber-700">
                +{data.timelineAdjustmentMonths} mo. timeline
              </span>
            )}
          </div>
        </div>
      )}

      {/* Active Constraints Details */}
      {activeConstraints.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {activeConstraints.map((c) => (
            <p key={c.category} className="text-xs text-muted-foreground">
              <span className="font-medium text-secondary capitalize">{categoryLabels[c.category] ?? c.category}:</span>{" "}
              {c.constructionImpact}
            </p>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground">
        {data.summary}
      </p>
    </div>
  );
}
