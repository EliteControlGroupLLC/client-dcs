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
  // Same bar as every other "Verified" label (≥ 90), and never while the
  // boundary match is uncertain.
  const isHighConfidence = data.confidence >= 90 && !data.uncertain;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-secondary">Jurisdiction</h3>
        </div>
        <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
          isHighConfidence
            ? "bg-primary/5 text-primary"
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
          <p className="text-xs text-muted-foreground mb-1.5">Source References</p>
          <div className="flex flex-wrap gap-2">
            {data.sourceUrls.slice(0, 2).map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 py-3.5 -my-3.5 text-xs text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {(() => {
                  try {
                    return new URL(url).hostname.replace(/^www\./, "");
                  } catch {
                    return "Source";
                  }
                })()}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
