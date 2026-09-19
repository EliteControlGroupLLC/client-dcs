"use client";

import { MapPin, Maximize2, Home, TreePine, FileText, Mountain, Ruler, Shield, ArrowLeftRight, LucideIcon, Hash } from "lucide-react";
import { ConfidenceBadge } from "./confidence-badge";
import { displayFieldValue, type PropertyIntelligence, type IntelligenceField } from "@/lib/property-intelligence/types";

interface PropertySummaryCardProps {
  data: PropertyIntelligence;
}

interface FieldDef {
  label: string;
  icon: LucideIcon;
  getField: (data: PropertyIntelligence) => IntelligenceField<string | number>;
  formatValue: (field: IntelligenceField<string | number>) => string;
}

const fields: FieldDef[] = [
  {
    label: "Address",
    icon: MapPin,
    getField: (d) => d.address,
    formatValue: (f) => displayFieldValue(f),
  },
  {
    label: "APN",
    icon: Hash,
    getField: (d) => d.apn,
    formatValue: (f) => displayFieldValue(f),
  },
  {
    label: "Lot Size",
    icon: Maximize2,
    getField: (d) => d.lotSizeSqFt,
    formatValue: (f) => displayFieldValue(f, "sq ft"),
  },
  {
    label: "Existing Home Square Footage",
    icon: Home,
    getField: (d) => d.homeAreaSqFt,
    formatValue: (f) => displayFieldValue(f, "sq ft"),
  },
  {
    label: "Structure Footprint",
    icon: Ruler,
    getField: (d) => d.footprintSqFt,
    formatValue: (f) => displayFieldValue(f, "sq ft"),
  },
  {
    label: "Open Yard Area",
    icon: TreePine,
    getField: (d) => d.openYardSqFt,
    formatValue: (f) => displayFieldValue(f, "sq ft"),
  },
  {
    label: "Zoning Category",
    icon: FileText,
    getField: (d) => d.zoning,
    formatValue: (f) => displayFieldValue(f),
  },
  {
    label: "ADU / JADU Allowances",
    icon: Shield,
    getField: (d) => d.aduAllowances,
    formatValue: (f) => displayFieldValue(f),
  },
  {
    label: "Height Limit",
    icon: ArrowLeftRight,
    getField: (d) => d.heightLimit,
    formatValue: (f) => displayFieldValue(f),
  },
  {
    label: "Setbacks",
    icon: ArrowLeftRight,
    getField: (d) => d.setbacks,
    formatValue: (f) => displayFieldValue(f),
  },
  {
    label: "Topography / Slope",
    icon: Mountain,
    getField: (d) => d.slope,
    formatValue: (f) => displayFieldValue(f),
  },
  {
    label: "Parcel Shape",
    icon: Maximize2,
    getField: (d) => d.parcelShape,
    formatValue: (f) => displayFieldValue(f),
  },
];

export function PropertySummaryCard({ data }: PropertySummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Home className="h-4 w-4 text-secondary" />
          </div>
          <h3 className="text-lg font-bold text-secondary">Property Summary</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />Verified
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-2" />Cross-checked
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-2" />Estimated
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((fieldDef) => {
          const field = fieldDef.getField(data);
          const Icon = fieldDef.icon;
          return (
            <div
              key={fieldDef.label}
              className="flex items-start gap-3 py-2.5 px-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
            >
              <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs text-muted-foreground">{fieldDef.label}</p>
                  <ConfidenceBadge
                    status={field.status}
                    confidence={field.confidence}
                    sources={field.sources}
                  />
                </div>
                <p className="text-sm font-semibold text-secondary">
                  {fieldDef.formatValue(field)}
                </p>
                {field.sources?.[0] && fieldDef.label !== "Address" && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">Source: {field.sources[0]}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Values marked &quot;Approx.&quot; should be treated as planning guidance until a site visit,
          survey, and permit-level review confirm the final build conditions.
        </p>
      </div>
    </div>
  );
}
