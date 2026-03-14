import { MapPin, Maximize2, Home, TreePine, FileText, Mountain, LucideIcon } from "lucide-react";

interface PropertyData {
  address: string;
  lotSizeSqFt: number;
  mainHomeFootprintSqFt: number;
  estimatedOpenAreaSqFt: number;
  zoning: string;
  slope: string;
}

interface PropertySummaryCardProps {
  data: PropertyData;
}

interface FieldDef {
  label: string;
  icon: LucideIcon;
  getValue: (data: PropertyData) => string;
}

const fields: FieldDef[] = [
  { label: "Selected Address", icon: MapPin, getValue: (d) => d.address },
  { label: "Estimated Lot Size", icon: Maximize2, getValue: (d) => `${d.lotSizeSqFt.toLocaleString()} sq ft` },
  { label: "Estimated Main Home Footprint", icon: Home, getValue: (d) => `${d.mainHomeFootprintSqFt.toLocaleString()} sq ft` },
  { label: "Estimated Open Yard Area", icon: TreePine, getValue: (d) => `${d.estimatedOpenAreaSqFt.toLocaleString()} sq ft` },
  { label: "Zoning Category", icon: FileText, getValue: (d) => d.zoning },
  { label: "Topography / Slope", icon: Mountain, getValue: (d) => d.slope },
];

export function PropertySummaryCard({ data }: PropertySummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Home className="h-4 w-4 text-secondary" />
        </div>
        <h3 className="text-lg font-bold text-secondary">Property Summary</h3>
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.label} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
              <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm font-semibold text-secondary truncate">
                  {field.getValue(data)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
