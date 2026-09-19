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
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-5 hover:border-accent/50 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Building className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Detected Structures</h3>
          <p className="text-xs text-white/75">
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
              className="flex items-center justify-between bg-secondary border border-white/10 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium text-white capitalize">
                  {structure.type}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/75">
                  {structure.areaSqFt.toLocaleString()} sq ft
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  structure.confidence >= 75
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-amber-500/10 text-amber-200"
                }`}>
                  {structure.confidence}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-white/70 mt-3">
        Structures detected via OpenStreetMap building data. Confidence reflects data quality.
      </p>
    </div>
  );
}
