"use client";

import { Scale, Ruler, ArrowUpFromLine, Car, Users, Sparkles } from "lucide-react";

interface AduRulesData {
  detachedMaxSqft: number;
  attachedMaxSqft: number;
  jaduMaxSqft: number;
  sideSetbackFt: number;
  rearSetbackFt: number;
  maxHeightFt: number;
  twoStoryAllowed: boolean;
  parkingRequired: boolean;
  ownerOccupancyNotes: string;
  bonusProgramNotes: string;
}

interface AduRulesSnapshotCardProps {
  data: AduRulesData;
  jurisdictionName: string;
}

export function AduRulesSnapshotCard({ data, jurisdictionName }: AduRulesSnapshotCardProps) {
  const rules = [
    {
      icon: Scale,
      label: "Max Detached ADU",
      value: `${data.detachedMaxSqft.toLocaleString()} sq ft`,
    },
    {
      icon: Scale,
      label: "Max Attached ADU",
      value: `${data.attachedMaxSqft.toLocaleString()} sq ft`,
    },
    {
      icon: Scale,
      label: "Max JADU",
      value: `${data.jaduMaxSqft.toLocaleString()} sq ft`,
    },
    {
      icon: Ruler,
      label: "Side Setback",
      value: `${data.sideSetbackFt} ft`,
    },
    {
      icon: Ruler,
      label: "Rear Setback",
      value: `${data.rearSetbackFt} ft`,
    },
    {
      icon: ArrowUpFromLine,
      label: "Max Height",
      value: `${data.maxHeightFt} ft`,
    },
    {
      icon: ArrowUpFromLine,
      label: "Two-Story Allowed",
      value: data.twoStoryAllowed ? "Yes" : "No / Limited",
    },
    {
      icon: Car,
      label: "Parking Required",
      value: data.parkingRequired ? "Yes" : "No (state exemption)",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
          <Scale className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-secondary">Local ADU Rules</h3>
          <p className="text-xs text-muted-foreground">{jurisdictionName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.label}
              className="flex items-start gap-2 py-2 px-3 rounded-xl bg-muted/30 border border-border/30"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground leading-tight">{rule.label}</p>
                <p className="text-xs font-semibold text-secondary">{rule.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {data.ownerOccupancyNotes && (
        <div className="mt-3 flex items-start gap-2 py-2 px-3 rounded-xl bg-blue-50/50 border border-blue-100">
          <Users className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-blue-600 font-medium">Owner Occupancy</p>
            <p className="text-xs text-blue-800">{data.ownerOccupancyNotes}</p>
          </div>
        </div>
      )}

      {data.bonusProgramNotes && data.bonusProgramNotes.toLowerCase().includes("bonus") && (
        <div className="mt-2 flex items-start gap-2 py-2 px-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-emerald-600 font-medium">Bonus Program</p>
            <p className="text-xs text-emerald-800">{data.bonusProgramNotes}</p>
          </div>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Rules reflect current jurisdiction standards. Actual requirements may vary based on
          specific lot conditions, overlays, and local amendments. Always verify with the planning department.
        </p>
      </div>
    </div>
  );
}
