"use client";

import { Sparkles, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

interface UpsideOpportunity {
  triggerType: string;
  title: string;
  summary: string;
  scenarioCount: number;
  estimatedUpsideLevel: string;
  recommendedFollowupFlow: string;
}

interface OpportunityDetectedCardProps {
  opportunities: UpsideOpportunity[];
}

function getLevelColor(level: string): string {
  if (level === "high") return "bg-emerald-500/10 border-emerald-400/30 text-emerald-200";
  if (level === "moderate") return "bg-amber-500/10 border-amber-400/30 text-amber-200";
  return "bg-secondary border-white/10 text-white/85";
}

function getLevelBadge(level: string): string {
  if (level === "high") return "bg-accent/10 border border-accent/30 text-accent-light";
  if (level === "moderate") return "bg-amber-500/15 text-amber-200";
  return "bg-white/10 text-white/80";
}

export function OpportunityDetectedCard({ opportunities }: OpportunityDetectedCardProps) {
  if (opportunities.length === 0) return null;

  return (
    <div className="rounded-2xl border border-accent/60 ring-1 ring-accent/30 bg-secondary-light shadow-lg shadow-black/20 p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Opportunity Detected</h3>
          <p className="text-xs text-white/75">
            This property may support more value than a standard single-ADU approach
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {opportunities.map((opp, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${getLevelColor(opp.estimatedUpsideLevel)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                <h4 className="font-semibold text-sm">{opp.title}</h4>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelBadge(opp.estimatedUpsideLevel)}`}>
                {opp.estimatedUpsideLevel === "high" ? "High Potential" : "Worth Exploring"}
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-3 opacity-90">{opp.summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-80">
                {opp.scenarioCount} scenario{opp.scenarioCount > 1 ? "s" : ""} available
              </span>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
              >
                Explore This Path
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
