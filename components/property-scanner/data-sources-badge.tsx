"use client";

import { Database, Check, X } from "lucide-react";

interface DataSourcesData {
  googlePlaces: boolean;
  attom: boolean;
  openStreetMap: boolean;
  zoneomics: boolean;
  rentCast: boolean;
  mapbox: boolean;
}

interface DataSourcesBadgeProps {
  data: DataSourcesData;
}

export function DataSourcesBadge({ data }: DataSourcesBadgeProps) {
  const sources = [
    { key: "googlePlaces", label: "Google Places", active: data.googlePlaces },
    { key: "attom", label: "ATTOM", active: data.attom },
    { key: "openStreetMap", label: "OpenStreetMap", active: data.openStreetMap },
    { key: "zoneomics", label: "Zoneomics", active: data.zoneomics },
    { key: "rentCast", label: "RentCast", active: data.rentCast },
    { key: "mapbox", label: "Mapbox", active: data.mapbox },
  ];

  const activeCount = sources.filter((s) => s.active).length;

  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-4 w-4 text-primary" />
        <h4 className="text-xs font-semibold text-secondary">
          Data Sources ({activeCount}/{sources.length} active)
        </h4>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source) => (
          <span
            key={source.key}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
              source.active
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-50 text-slate-400 border border-slate-200"
            }`}
          >
            {source.active ? (
              <Check className="h-2.5 w-2.5" />
            ) : (
              <X className="h-2.5 w-2.5" />
            )}
            {source.label}
          </span>
        ))}
      </div>
    </div>
  );
}
