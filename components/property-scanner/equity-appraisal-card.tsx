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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form";

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
  unavailableReason?: string;
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

  // Equity state (computed client-side, NOT from the API). The balance is
  // unknown until the owner enters it — never assumed.
  const [mortgageBalance, setMortgageBalance] = useState<number | null>(null);
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

        setMortgageBalance(null);
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
  const balanceKnown = effectiveBalance !== null;

  const equity = Math.max(0, estimatedValue - (effectiveBalance ?? 0));
  const equityPct =
    estimatedValue > 0 ? Math.round((equity / estimatedValue) * 100) : 0;
  const usableEquity = Math.max(0, estimatedValue * 0.85 - (effectiveBalance ?? 0));

  return (
    <div className="bg-secondary-light text-white rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Home className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">
            Your Home Value &amp; Equity
          </h3>
          <p className="text-sm text-white/75">
            Estimated value, equity, and what the recommended ADU could add
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 flex flex-col items-center justify-center gap-3 text-center">
          <div className="h-6 w-6 rounded-full border-2 border-white/15 border-t-accent animate-spin" />
          <p className="text-sm text-white/75">
            Estimating your home value&hellip;
          </p>
          <div className="w-full max-w-xs space-y-2 mt-2">
            <div className="h-8 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-4 w-2/3 mx-auto rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-white/75 mt-0.5 shrink-0" />
          <p className="text-sm text-white/80">
            We couldn&apos;t auto-estimate this address &mdash; our team can
            pull a precise valuation for you.
          </p>
        </div>
      )}

      {/* Unavailable valuation */}
      {!loading && !error && valuation && !valuation.available && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-white/75 mt-0.5 shrink-0" />
          <p className="text-sm text-white/80">
            Home value: not available.{" "}
            {valuation.unavailableReason ? `${valuation.unavailableReason} ` : ""}
            Our team can pull a precise valuation for you.
          </p>
        </div>
      )}

      {/* Main content */}
      {!loading && !error && valuation && valuation.available && (
        <div className="space-y-4">
          {/* 4. Current value */}
          <div className="rounded-xl bg-secondary border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-accent" />
                <h4 className="text-sm font-semibold text-white">
                  Estimated home value
                </h4>
              </div>
              {valuation.pricePerSqft != null && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-accent/10 text-accent-light border border-accent/30">
                  {formatCurrencyFull(valuation.pricePerSqft)}/sqft
                </span>
              )}
            </div>

            <p className="text-3xl font-bold text-accent leading-tight">
              {formatCurrencyFull(estimatedValue)}
            </p>

            {valuation.valueLow != null && valuation.valueHigh != null && (
              <p className="text-xs text-white/75 mt-1">
                Range {formatCurrencyFull(valuation.valueLow)}&nbsp;&ndash;{" "}
                {formatCurrencyFull(valuation.valueHigh)}
              </p>
            )}

            <p className="text-xs text-white/75 mt-2">
              {valuation.comps.length > 0
                ? `Automated valuation (RentCast AVM) for this address, based on ${valuation.comps.length} comparable properties nearby`
                : "Automated valuation (RentCast AVM) for this address"}
            </p>
          </div>

          {/* 5. Comps */}
          {valuation.comps.length > 0 && (
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setCompsExpanded((v) => !v)}
                className="w-full min-h-11 flex items-center justify-between p-3 text-left hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-xs font-semibold text-white">
                  View comparable properties
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/75">
                    {valuation.comps.length} comps
                  </span>
                  {compsExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-white/75" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-white/75" />
                  )}
                </div>
              </button>

              {compsExpanded && (
                <div className="border-t border-white/10 divide-y divide-white/10">
                  {valuation.comps.map((comp, i) => (
                    <div key={i} className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-white leading-snug">
                          {comp.address}
                        </p>
                        <p className="text-xs font-bold text-white whitespace-nowrap">
                          {formatCurrencyFull(comp.price)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-white/75">
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
            <div className="rounded-xl bg-secondary border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                {owner.heldInTrust ? (
                  <Building2 className="h-4 w-4 text-white" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-white" />
                )}
                <h4 className="text-sm font-semibold text-white">
                  Owner of record
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg bg-white/[0.04]">
                  <p className="text-xs text-white/75">
                    {owner.names.length > 1 ? "Owners" : "Owner"}
                  </p>
                  <p className="text-sm font-semibold text-white text-right leading-snug">
                    {owner.names.join(" & ")}
                  </p>
                </div>

                {owner.ownerType && (
                  <div className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg bg-white/[0.04]">
                    <p className="text-xs text-white/75">Owner type</p>
                    <p className="text-sm font-semibold text-white text-right capitalize">
                      {owner.ownerType}
                    </p>
                  </div>
                )}

                {owner.ownerOccupied != null && (
                  <div className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg bg-white/[0.04]">
                    <p className="text-xs text-white/75">Occupancy</p>
                    <p className="text-sm font-semibold text-white text-right">
                      {owner.ownerOccupied ? "Owner-occupied" : "Non-owner-occupied"}
                    </p>
                  </div>
                )}
              </div>

              {owner.heldInTrust && (
                <p className="mt-3 text-xs leading-relaxed text-white/75">
                  This property is held in a trust or entity. A trustee or
                  authorized signer will typically need to sign the ADU
                  agreement and any financing.
                </p>
              )}

              <p className="mt-3 text-xs text-white/75">
                Ownership from public property records (via RentCast), matched to this address. Verify against title before closing.
              </p>
            </div>
          )}

          {/* 6. Equity */}
          <div className="rounded-xl bg-secondary border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <PiggyBank className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-semibold text-white">
                Your equity
              </h4>
            </div>

            <div className="space-y-2 mb-4">
              <Label tone="dark" htmlFor="mortgage-balance">Remaining mortgage balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/75">
                  $
                </span>
                <Input
                  tone="dark"
                  id="mortgage-balance"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={ownOutright}
                  value={ownOutright ? 0 : mortgageBalance ?? ""}
                  onChange={(e) =>
                    setMortgageBalance(
                      e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                  className="pl-7 disabled:opacity-100 disabled:bg-white/5 disabled:text-white/75"
                  placeholder="Enter your balance"
                />
              </div>

              <label className="flex items-center gap-2 min-h-11 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ownOutright}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setOwnOutright(checked);
                    if (checked) setMortgageBalance(0);
                  }}
                  className="h-4 w-4 rounded border-white/30 accent-primary [color-scheme:dark] focus:ring-accent/30"
                />
                <span className="text-xs text-white/75">
                  I own it outright
                </span>
              </label>
            </div>

            {!balanceKnown ? (
              <p className="pt-3 border-t border-white/10 text-xs text-white/75">
                Enter your remaining mortgage balance (or check &ldquo;I own it outright&rdquo;) to see your equity.
              </p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <p className="text-xs text-white/75">
                  Estimated equity
                </p>
                <p className="text-xl font-bold text-white">
                  {formatCurrencyFull(equity)}
                  <span className="ml-1.5 text-xs font-medium text-accent-light">
                    {equityPct}%
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-white/75">
                  Available to fund your project
                </p>
                <p className="text-xl font-bold text-accent">
                  {formatCurrencyFull(usableEquity)}
                </p>
                <p className="text-xs text-white/75">
                  up to 85% CLTV
                </p>
              </div>
            </div>
            )}
          </div>

          {/* 7. Projected value */}
          {data?.projectedValue && (
            <div className="rounded-xl bg-secondary border border-accent/60 ring-1 ring-accent/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <h4 className="text-sm font-semibold text-white">
                    After building the {recommendedAduLabel}
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-accent/10 text-accent-light border border-accent/30">
                  <ArrowUpRight className="h-3 w-3" />
                  +{formatCurrencyK(data.aduValueAdd.expected)} added value
                </span>
              </div>

              <p className="text-xs text-white/75">
                Projected home value
              </p>
              <p className="text-3xl font-bold text-accent leading-tight">
                {formatCurrencyFull(data.projectedValue.expected)}
              </p>

              <p className="text-xs text-white/75 mt-1">
                Range {formatCurrencyFull(data.projectedValue.low)}&nbsp;&ndash;{" "}
                {formatCurrencyFull(data.projectedValue.high)}
              </p>

              <p className="text-sm font-semibold text-accent mt-2">
                +{formatCurrencyFull(data.aduValueAdd.expected)} added by your{" "}
                {recommendedAduType}
              </p>

              {data.aduValueAdd.method && (
                <p className="text-xs text-white/75 mt-2">
                  {data.aduValueAdd.method}
                </p>
              )}
            </div>
          )}

          {/* 8. Disclaimer */}
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-white/75 leading-relaxed">
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
