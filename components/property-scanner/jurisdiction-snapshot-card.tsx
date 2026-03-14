"use client";

import { Building, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";

interface JurisdictionData {
  id: string;
  name: string;
  type: string;
  confidence: number;
  uncertain: boolean;
  rulesVersion: string;
  sourceUrls: string[];
}

interface JurisdictionSnapshotCardProps {
  data: JurisdictionData;
}

export function JurisdictionSnapshotCard({ data }: JurisdictionSnapshotCardProps) {
  const isHighConfidence = data.confidence >= 80;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Building className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-secondary">Jurisdiction</h3>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
          isHighConfidence
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}>
          {isHighConfidence ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          {isHighConfidence ? "Verified" : "Estimated"}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between py-2 px-3 rounded-xl bg-muted/30 border border-border/30">
          <div>
            <p className="text-xs text-muted-foreground">Jurisdiction</p>
            <p className="text-sm font-semibold text-secondary">{data.name}</p>
          </div>
          <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">
            {data.type}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30 border border-border/30">
          <div>
            <p className="text-xs text-muted-foreground">Rules Version</p>
            <p className="text-sm font-semibold text-secondary">{data.rulesVersion}</p>
          </div>
        </div>

        {data.uncertain && (
          <div className="flex items-start gap-2 py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Jurisdiction boundary could not be precisely determined. Rules shown are our best
              match but should be confirmed with the local planning department.
            </p>
          </div>
        )}
      </div>

      {data.sourceUrls.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground mb-1.5">Source References</p>
          <div className="flex flex-wrap gap-2">
            {data.sourceUrls.slice(0, 2).map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                Municipal Code
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
