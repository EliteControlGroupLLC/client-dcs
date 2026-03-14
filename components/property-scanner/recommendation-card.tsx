import { Home, Building2, Warehouse, ArrowUpFromLine } from "lucide-react";
import { FeasibilityBadge } from "./feasibility-badge";

type FeasibilityLevel = "Likely" | "Possible" | "Limited" | "Not Recommended";

interface RecommendationData {
  type: string;
  feasibility: FeasibilityLevel;
  estimatedSizeRange: string;
  priceRange: string;
  description: string;
}

interface RecommendationCardProps {
  data: RecommendationData;
  isRecommended?: boolean;
}

const iconMap: Record<string, typeof Home> = {
  "Detached ADU": Home,
  "Attached ADU": Building2,
  "Garage Conversion": Warehouse,
  "Second-Story ADU": ArrowUpFromLine,
};

export function RecommendationCard({ data, isRecommended = false }: RecommendationCardProps) {
  const Icon = iconMap[data.type] || Home;

  return (
    <div
      className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
        isRecommended
          ? "border-primary bg-primary/[0.02] shadow-md"
          : "border-border bg-white hover:border-primary/30"
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/25">
            Best Fit
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isRecommended ? "bg-primary/10" : "bg-muted"
          }`}>
            <Icon className={`h-6 w-6 ${isRecommended ? "text-primary" : "text-secondary"}`} />
          </div>
          <div>
            <h4 className="font-bold text-secondary">{data.type}</h4>
            <FeasibilityBadge level={data.feasibility} size="sm" />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{data.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Est. Size Range</p>
          <p className="text-sm font-bold text-secondary">{data.estimatedSizeRange}</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Est. Price Range</p>
          <p className="text-sm font-bold text-primary">{data.priceRange}</p>
        </div>
      </div>
    </div>
  );
}
