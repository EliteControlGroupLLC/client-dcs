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
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Scale className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Local ADU Rules</h3>
          <p className="text-sm text-white/75">{jurisdictionName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.label}
              className="flex items-start gap-2 py-2 px-3 rounded-xl bg-secondary border border-white/10"
            >
              <Icon className="h-3.5 w-3.5 text-white/75 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/75 leading-tight">{rule.label}</p>
                <p className="text-sm font-semibold text-white">{rule.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {data.ownerOccupancyNotes && (
        <div className="mt-3 flex items-start gap-2 py-2 px-3 rounded-xl bg-secondary border border-white/10">
          <Users className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-white font-semibold">Owner Occupancy</p>
            <p className="text-xs text-white/75">{data.ownerOccupancyNotes}</p>
          </div>
        </div>
      )}

      {data.bonusProgramNotes && data.bonusProgramNotes.toLowerCase().includes("bonus") && (
        <div className="mt-2 flex items-start gap-2 py-2 px-3 rounded-xl bg-secondary border border-white/10">
          <Sparkles className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-white font-semibold">Bonus Program</p>
            <p className="text-xs text-white/75">{data.bonusProgramNotes}</p>
          </div>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-white/10">
        <p className="text-xs text-white/75 leading-relaxed">
          Rules reflect current jurisdiction standards. Actual requirements may vary based on
          specific lot conditions, overlays, and local amendments. Always verify with the planning department.
        </p>
      </div>
    </div>
  );
}
