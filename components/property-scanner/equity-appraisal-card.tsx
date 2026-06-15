"use client";

import { useState, useEffect } from "react";
import {
  Home,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  PiggyBank,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Building2,
} from "lucide-react";

function formatCurrencyFull(v: number): string {
  return `$${Math.round(v).toLocaleString()}`;
}

function formatCurrencyK(v: number): string {
  return Math.abs(v) >= 1000
    ? `$${(v / 1000).toFixed(0)}K`
    : `$${Math.round(v).toLocaleString()}`;
}

interface Comp {
  address: string;
  price: number;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  distanceMi: number | null;
  pricePerSqft: number | null;
}

interface Valuation {
  estimatedValue: number | null;
  valueLow: number | null;
  valueHigh: number | null;
  pricePerSqft: number | null;
  comps: Comp[];
  confidence: number;
  available: boolean;
  source: "rentcast" | "estimated";
}

interface ValueAdd {
  low: number;
  expected: number;
  high: number;
  method: string;
}

interface ProjectedValue {
  low: number;
  expected: number;
  high: number;
}

interface Owner {
  names: string[];
  ownerType: string | null;
  heldInTrust: boolean;
  ownerOccupied: boolean | null;
  available: boolean;
  source: "rentcast" | "estimated";
}

interface ValuationResponse {
  success: true;
  valuation: Valuation;
  owner: Owner;
  aduValueAdd: ValueAdd;
  projectedValue: ProjectedValue | null;
}

interface EquityAppraisalCardProps {
  address: string;
  recommendedAduLabel: string;
  recommendedAduSqFt: number;
  recommendedAduType: string;
  homeAreaSqFt: number | null;
  aduAnnualNetIncome: number | null;
  aduTotalCost: number | null;
}

export function EquityAppraisalCard({
  address,
  recommendedAduLabel,
  recommendedAduSqFt,
  recommendedAduType,
  homeAreaSqFt,
  aduAnnualNetIncome,
  aduTotalCost,
}: EquityAppraisalCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ValuationResponse | null>(null);

  // Equity state (computed client-side, NOT from the API)
  const [mortgageBalance, setMortgageBalance] = useState(0);
  const [ownOutright, setOwnOutright] = useState(false);
  const [compsExpanded, setCompsExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchValuation() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/property-valuation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address,
            homeAreaSqFt,
            recommendedAduSqFt,
            aduAnnualNetIncome,
            aduTotalCost,
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const json = (await res.json()) as ValuationResponse;
        if (cancelled) return;

        setData(json);

        // Seed mortgage balance at ~50% of estimated value once data loads.
        const ev = json.valuation?.estimatedValue;
        setMortgageBalance(ev ? Math.round(ev * 0.5) : 0);
        setOwnOutright(false);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to estimate your home value right now."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchValuation();

    return () => {
      cancelled = true;
    };
  }, [
    address,
    homeAreaSqFt,
    recommendedAduSqFt,
    aduAnnualNetIncome,
    aduTotalCost,
  ]);

  const valuation = data?.valuation;
  const owner = data?.owner;
  const estimatedValue = valuation?.estimatedValue ?? 0;
  const effectiveBalance = ownOutright ? 0 : mortgageBalance;

  const equity = Math.max(0, estimatedValue - effectiveBalance);
  const equityPct =
    estimatedValue > 0 ? Math.round((equity / estimatedValue) * 100) : 0;
  const usableEquity = Math.max(0, estimatedValue * 0.85 - effectiveBalance);

  return (
    <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Home className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-secondary">
            Your Home Value &amp; Equity
          </h3>
          <p className="text-xs text-muted-foreground">
            Estimated value, equity, and what the recommended ADU could add
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col items-center justify-center gap-3 text-center">
          <div className="h-6 w-6 rounded-full border-2 border-secondary/20 border-t-secondary animate-spin" />
          <p className="text-sm text-muted-foreground">
            Estimating your home value&hellip;
          </p>
          <div className="w-full max-w-xs space-y-2 mt-2">
            <div className="h-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-2/3 mx-auto rounded bg-muted animate-pulse" />
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-secondary">
            We couldn&apos;t auto-estimate this address &mdash; our team can
            pull a precise valuation for you.
          </p>
        </div>
      )}

      {/* Unavailable valuation */}
      {!loading && !error && valuation && !valuation.available && (
        <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-secondary">
            We couldn&apos;t auto-estimate this address &mdash; our team can
            pull a precise valuation for you.
          </p>
        </div>
      )}

      {/* Main content */}
      {!loading && !error && valuation && valuation.available && (
        <div className="space-y-4">
          {/* 4. Current value */}
          <div className="rounded-xl bg-gradient-to-br from-secondary/[0.03] to-secondary/[0.08] border border-secondary/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-secondary" />
                <h4 className="text-sm font-semibold text-secondary">
                  Estimated home value
                </h4>
              </div>
              {valuation.pricePerSqft != null && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                  {formatCurrencyFull(valuation.pricePerSqft)}/sqft
                </span>
              )}
            </div>

            <p className="text-3xl font-bold text-secondary leading-tight">
              {formatCurrencyFull(estimatedValue)}
            </p>

            {valuation.valueLow != null && valuation.valueHigh != null && (
              <p className="text-xs text-muted-foreground mt-1">
                Range {formatCurrencyFull(valuation.valueLow)} &ndash;{" "}
                {formatCurrencyFull(valuation.valueHigh)}
              </p>
            )}

            <p className="text-[11px] text-muted-foreground mt-2">
              {valuation.source === "rentcast" && valuation.comps.length > 0
                ? `Based on ${valuation.comps.length} comparable sales nearby`
                : "Market estimate"}
            </p>
          </div>

          {/* 5. Comps */}
          {valuation.comps.length > 0 && (
            <div className="border border-border/50 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setCompsExpanded((v) => !v)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="text-xs font-semibold text-secondary">
                  View comparable sales
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {valuation.comps.length} comps
                  </span>
                  {compsExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {compsExpanded && (
                <div className="border-t border-border/30 divide-y divide-border/30">
                  {valuation.comps.map((comp, i) => (
                    <div key={i} className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-secondary leading-snug">
                          {comp.address}
                        </p>
                        <p className="text-xs font-bold text-secondary whitespace-nowrap">
                          {formatCurrencyFull(comp.price)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-muted-foreground">
                        {comp.sqft != null && <span>{comp.sqft.toLocaleString()} sq ft</span>}
                        {comp.bedrooms != null && <span>{comp.bedrooms} bd</span>}
                        {comp.bathrooms != null && <span>{comp.bathrooms} ba</span>}
                        {comp.pricePerSqft != null && (
                          <span>{formatCurrencyFull(comp.pricePerSqft)}/sqft</span>
                        )}
                        {comp.distanceMi != null && (
                          <span>{comp.distanceMi} mi away</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5b. Owner of record */}
          {owner?.available && owner.names.length > 0 && (
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                {owner.heldInTrust ? (
                  <Building2 className="h-4 w-4 text-secondary" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                )}
                <h4 className="text-sm font-semibold text-secondary">
                  Owner of record
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    {owner.names.length > 1 ? "Owners" : "Owner"}
                  </p>
                  <p className="text-sm font-semibold text-secondary text-right leading-snug">
                    {owner.names.join(" & ")}
                  </p>
                </div>

                {owner.ownerType && (
                  <div className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Title held as</p>
                    <p className="text-sm font-semibold text-secondary text-right capitalize">
                      {owner.ownerType}
                    </p>
                  </div>
                )}

                {owner.ownerOccupied != null && (
                  <div className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                    <p className="text-sm font-semibold text-secondary text-right">
                      {owner.ownerOccupied ? "Owner-occupied" : "Non-owner-occupied"}
                    </p>
                  </div>
                )}
              </div>

              {owner.heldInTrust && (
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  This property is held in a trust or entity. A trustee or
                  authorized signer will typically need to sign the ADU
                  agreement and any financing.
                </p>
              )}

              <p className="mt-3 text-[10px] text-muted-foreground">
                Ownership from public property records. Verify against title before closing.
              </p>
            </div>
          )}

          {/* 6. Equity */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <PiggyBank className="h-4 w-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-secondary">
                Your equity
              </h4>
            </div>

            <div className="space-y-2 mb-4">
              <label
                htmlFor="mortgage-balance"
                className="text-[11px] font-medium text-muted-foreground block"
              >
                Remaining mortgage balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <input
                  id="mortgage-balance"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={ownOutright}
                  value={ownOutright ? 0 : mortgageBalance}
                  onChange={(e) =>
                    setMortgageBalance(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-lg border border-border bg-white pl-7 pr-3 py-2 text-sm text-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20 disabled:bg-muted disabled:text-muted-foreground"
                  placeholder="0"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={ownOutright}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setOwnOutright(checked);
                    if (checked) setMortgageBalance(0);
                  }}
                  className="h-3.5 w-3.5 rounded border-border text-emerald-600 focus:ring-emerald-500/30"
                />
                <span className="text-xs text-muted-foreground">
                  I own it outright
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
              <div>
                <p className="text-[10px] text-muted-foreground">
                  Estimated equity
                </p>
                <p className="text-xl font-bold text-secondary">
                  {formatCurrencyFull(equity)}
                  <span className="ml-1.5 text-xs font-medium text-emerald-600">
                    {equityPct}%
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">
                  Available to fund your project
                </p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrencyFull(usableEquity)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  up to 85% CLTV
                </p>
              </div>
            </div>
          </div>

          {/* 7. Projected value */}
          {data?.projectedValue && (
            <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-secondary">
                    After building the {recommendedAduLabel}
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
                  <ArrowUpRight className="h-3 w-3" />
                  +{formatCurrencyK(data.aduValueAdd.expected)} added value
                </span>
              </div>

              <p className="text-[10px] text-muted-foreground">
                Projected home value
              </p>
              <p className="text-3xl font-bold text-secondary leading-tight">
                {formatCurrencyFull(data.projectedValue.expected)}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Range {formatCurrencyFull(data.projectedValue.low)} &ndash;{" "}
                {formatCurrencyFull(data.projectedValue.high)}
              </p>

              <p className="text-sm font-semibold text-emerald-600 mt-2">
                +{formatCurrencyFull(data.aduValueAdd.expected)} added by your{" "}
                {recommendedAduType}
              </p>

              {data.aduValueAdd.method && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  {data.aduValueAdd.method}
                </p>
              )}
            </div>
          )}

          {/* 8. Disclaimer */}
          <div className="pt-3 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Estimates only &mdash; not a formal appraisal. Home value is
              automated and approximate; equity depends on your actual mortgage
              balance; the value an ADU adds varies by finish, layout, and
              market. A licensed appraiser provides the final figure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
