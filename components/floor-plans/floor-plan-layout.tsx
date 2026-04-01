"use client";

import { Layers } from "lucide-react";

interface FloorPlanLayoutProps {
  planId: string;
  sqFt: number;
  bedrooms: number;
  bathrooms: number;
  className?: string;
  showLabels?: boolean;
  showDimensions?: boolean;
}

export function FloorPlanLayout({
  className = "",
}: FloorPlanLayoutProps) {
  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Layers className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Floor plan layouts in development</p>
      </div>
    </div>
  );
}

export default FloorPlanLayout;
