"use client";

import { Building, Home, Warehouse } from "lucide-react";

interface DetectedStructure {
  type: string;
  areaSqFt: number;
  confidence: number;
}

interface DetectedStructuresCardProps {
  structures: DetectedStructure[];
}

const structureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "main residence": Home,
  "detached garage": Warehouse,
  "possible detached ADU": Building,
  "accessory structure": Building,
};

export function DetectedStructuresCard({ structures }: DetectedStructuresCardProps) {
  if (!structures || structures.length <= 1) return null;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-secondary text-sm">Detected Structures</h3>
          <p className="text-xs text-muted-foreground">
            {structures.length} structure{structures.length !== 1 ? "s" : ""} identified from satellite data
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {structures.map((structure, idx) => {
          const Icon = structureIcons[structure.type] || Building;
          return (
            <div
              key={`${structure.type}-${idx}`}
              className="flex items-center justify-between bg-muted rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-secondary capitalize">
                  {structure.type}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {structure.areaSqFt.toLocaleString()} sq ft
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  structure.confidence >= 75
                    ? "bg-primary/5 text-primary"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {structure.confidence}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Structures detected via OpenStreetMap building data. Confidence reflects data quality.
      </p>
    </div>
  );
}
