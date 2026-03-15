"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, AlertTriangle, CheckCircle, HelpCircle, XCircle, Info } from "lucide-react";
import type { SourceAudit, ReconciledField, DiscrepancyRecord, FieldVerificationStatus } from "@/lib/property-intelligence/types";

interface ShowSourcesPanelProps {
  sourceAudit: SourceAudit;
  isAdmin: boolean;
}

const STATUS_CONFIG: Record<FieldVerificationStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  verified: { label: "Verified", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  estimated: { label: "Estimated", color: "text-amber-600 bg-amber-50", icon: HelpCircle },
  inferred: { label: "Inferred", color: "text-blue-600 bg-blue-50", icon: Info },
  "under-review": { label: "Under Review", color: "text-red-600 bg-red-50", icon: AlertTriangle },
  rejected: { label: "Rejected", color: "text-gray-500 bg-gray-100", icon: XCircle },
};

const TIER_LABELS: Record<string, string> = {
  tier1: "Tier 1 (Primary)",
  tier2: "Tier 2 (Geometry)",
  tier3: "Tier 3 (Supplemental)",
};

export function ShowSourcesPanel({ sourceAudit, isAdmin }: ShowSourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  if (!isAdmin) return null;

  const toggleField = (fieldName: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldName)) {
        next.delete(fieldName);
      } else {
        next.add(fieldName);
      }
      return next;
    });
  };

  const fields: { name: string; label: string; field: ReconciledField<string | number> }[] = [
    { name: "address", label: "Address", field: sourceAudit.address },
    { name: "apn", label: "APN", field: sourceAudit.apn },
    { name: "lotSizeSqFt", label: "Lot Size", field: sourceAudit.lotSizeSqFt },
    { name: "zoning", label: "Zoning", field: sourceAudit.zoning },
    { name: "landUse", label: "Land Use", field: sourceAudit.landUse },
    { name: "homeAreaSqFt", label: "Home Area (sqft)", field: sourceAudit.homeAreaSqFt },
    { name: "footprintSqFt", label: "Footprint (sqft)", field: sourceAudit.footprintSqFt },
    { name: "openYardSqFt", label: "Open Yard (sqft)", field: sourceAudit.openYardSqFt },
    { name: "parcelShape", label: "Parcel Shape", field: sourceAudit.parcelShape },
    { name: "slope", label: "Slope", field: sourceAudit.slope },
    { name: "rentEstimate", label: "Rent Estimate", field: sourceAudit.rentEstimate },
    { name: "recommendedAduPath", label: "Recommended ADU Path", field: sourceAudit.recommendedAduPath },
  ];

  return (
    <div className="border border-indigo-200 rounded-xl overflow-hidden bg-indigo-50/30">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-indigo-50/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <EyeOff className="h-4 w-4 text-indigo-600" /> : <Eye className="h-4 w-4 text-indigo-600" />}
          <span className="text-sm font-semibold text-indigo-900">Show Sources (Admin Only)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">
            {sourceAudit.totalSourcesConsulted} sources | {sourceAudit.verifiedFieldCount}/{sourceAudit.fieldCount} verified
          </span>
          {sourceAudit.discrepancies.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
              {sourceAudit.discrepancies.length} discrepancies
            </span>
          )}
        </div>
        {isExpanded ? <ChevronDown className="h-4 w-4 text-indigo-400" /> : <ChevronRight className="h-4 w-4 text-indigo-400" />}
      </button>

      {isExpanded && (
        <div className="border-t border-indigo-200 px-4 py-3 space-y-3">
          {/* Summary Bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <StatBox label="Verified" value={sourceAudit.verifiedFieldCount} color="text-emerald-700 bg-emerald-50" />
            <StatBox label="Estimated" value={sourceAudit.estimatedFieldCount} color="text-amber-700 bg-amber-50" />
            <StatBox label="Under Review" value={sourceAudit.underReviewFieldCount} color="text-red-700 bg-red-50" />
            <StatBox label="Discrepancies" value={sourceAudit.discrepancies.length} color="text-purple-700 bg-purple-50" />
          </div>

          {/* Discrepancies Section */}
          {sourceAudit.discrepancies.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Discrepancies Detected
              </h4>
              {sourceAudit.discrepancies.map((d, i) => (
                <DiscrepancyRow key={`${d.field}-${i}`} discrepancy={d} />
              ))}
            </div>
          )}

          {/* Field-by-Field Breakdown */}
          <div className="space-y-1">
            {fields.map(({ name, label, field }) => (
              <FieldRow
                key={name}
                fieldName={name}
                label={label}
                field={field}
                isExpanded={expandedFields.has(name)}
                onToggle={() => toggleField(name)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="text-[10px] text-indigo-400 text-center pt-1 border-t border-indigo-100">
            Reconciled at {new Date(sourceAudit.reconciliationTimestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-lg px-2 py-1.5 ${color}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px]">{label}</div>
    </div>
  );
}

function DiscrepancyRow({ discrepancy }: { discrepancy: DiscrepancyRecord }) {
  const severityColor = discrepancy.severity === "high" ? "text-red-700" : discrepancy.severity === "medium" ? "text-amber-700" : "text-yellow-600";
  return (
    <div className="mb-2 last:mb-0 text-[11px]">
      <div className="flex items-center gap-1.5">
        <span className={`font-semibold ${severityColor} uppercase`}>[{discrepancy.severity}]</span>
        <span className="text-amber-900 font-medium">{discrepancy.field}</span>
      </div>
      <p className="text-amber-800 mt-0.5">{discrepancy.description}</p>
      <p className="text-amber-600 italic">Resolution: {discrepancy.resolution}</p>
    </div>
  );
}

function FieldRow({
  fieldName,
  label,
  field,
  isExpanded,
  onToggle,
}: {
  fieldName: string;
  label: string;
  field: ReconciledField<string | number>;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusConfig = STATUS_CONFIG[field.finalStatus];
  const StatusIcon = statusConfig.icon;
  const displayValue = typeof field.finalValue === "number"
    ? field.finalValue.toLocaleString()
    : String(field.finalValue);

  return (
    <div className="border border-indigo-100 rounded-lg overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-indigo-50/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {isExpanded ? <ChevronDown className="h-3 w-3 text-indigo-400 shrink-0" /> : <ChevronRight className="h-3 w-3 text-indigo-400 shrink-0" />}
          <span className="text-xs font-medium text-indigo-900">{label}</span>
          {field.discrepancyDetected && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary font-medium truncate max-w-[200px]">{displayValue}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 ${statusConfig.color}`}>
            <StatusIcon className="h-2.5 w-2.5" />
            {statusConfig.label}
          </span>
          <span className="text-[10px] text-indigo-400">{field.finalConfidence}%</span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-indigo-50 px-3 py-2 bg-indigo-50/20 space-y-2">
          {/* Selection Reason */}
          <div className="text-[10px] text-indigo-600">
            <span className="font-medium">Selected:</span> {field.selectedSource} — {field.selectionReason}
          </div>

          {/* Discrepancy Detail */}
          {field.discrepancyDetail && (
            <div className="text-[10px] text-amber-600 bg-amber-50 rounded px-2 py-1">
              {field.discrepancyDetail}
            </div>
          )}

          {/* All Candidates */}
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-indigo-700">
              All Candidates ({field.candidates.length}):
            </div>
            {field.candidates.map((c, i) => {
              const cStatus = STATUS_CONFIG[c.status];
              const CIcon = cStatus.icon;
              const isWinner = c.sourceName === field.selectedSource;
              const cValue = typeof c.value === "number" ? c.value.toLocaleString() : String(c.value);
              return (
                <div
                  key={`${fieldName}-candidate-${i}`}
                  className={`flex items-center justify-between text-[10px] px-2 py-1 rounded ${
                    isWinner ? "bg-indigo-100 border border-indigo-200" : "bg-white border border-indigo-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CIcon className={`h-2.5 w-2.5 shrink-0 ${cStatus.color.split(" ")[0]}`} />
                    <span className={`font-medium ${isWinner ? "text-indigo-900" : "text-gray-700"}`}>
                      {c.sourceName}
                    </span>
                    <span className="text-[9px] text-indigo-400">{TIER_LABELS[c.sourceTier]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-secondary truncate max-w-[150px]">{cValue}</span>
                    <span className="text-indigo-400">{c.confidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
