import { Ruler, ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";

interface BuildableAreaData {
  requiredMainHomeSeparationFt: number;
  requiredPropertyLineSetbackFt: number;
  estimatedBuildableEnvelopeSqFt: number;
  /** Overrides the numeric envelope when it isn't a measured value. */
  envelopeLabel?: string;
  oneStoryPotential: string;
  twoStoryPotential: string;
}

interface BuildableAreaCardProps {
  data: BuildableAreaData;
}

export function BuildableAreaCard({ data }: BuildableAreaCardProps) {
  const items = [
    {
      label: "Required separation from main home",
      value: `${data.requiredMainHomeSeparationFt} ft`,
      icon: ArrowLeftRight,
    },
    {
      label: "Required setback from property lines",
      value: `${data.requiredPropertyLineSetbackFt} ft`,
      icon: ArrowLeftRight,
    },
    {
      label: "Estimated buildable envelope",
      value: data.envelopeLabel ?? `${data.estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft`,
      icon: Ruler,
      highlight: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Ruler className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-secondary">Buildable Area Analysis</h3>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-3 py-3 px-4 rounded-xl ${
                item.highlight ? "bg-primary/5 border border-primary/20" : "bg-muted/50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${item.highlight ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm text-secondary">{item.label}</span>
              </div>
              <span className={`text-sm font-bold whitespace-nowrap ${item.highlight ? "text-primary" : "text-secondary"}`}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* ADU potential */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-secondary">ADU Size Potential</h4>
        <div className="flex items-start gap-3 py-2">
          {/^(not|site review|two-story detached adus aren)/i.test(data.oneStoryPotential) ? (
            <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="text-xs text-muted-foreground">1-Story ADU</p>
            <p className="text-sm font-semibold text-secondary">{data.oneStoryPotential}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 py-2">
          {/^(not|site review|two-story detached adus aren)/i.test(data.twoStoryPotential) ? (
            <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="text-xs text-muted-foreground">2-Story ADU</p>
            <p className="text-sm font-semibold text-secondary">{data.twoStoryPotential}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
