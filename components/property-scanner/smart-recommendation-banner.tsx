import { Sparkles } from "lucide-react";

interface SmartRecommendationBannerProps {
  recommendation: string;
  details: string;
}

export function SmartRecommendationBanner({ recommendation, details }: SmartRecommendationBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary to-secondary-light p-6 sm:p-8 text-white shadow-xl animate-slide-up" style={{ animationDelay: "0.3s" }}>
      {/* Soft emerald glow — same wash as the dark sections sitewide */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)]" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Smart Recommendation</p>
            <p className="text-xs text-white/75">Based on your property scan</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-2">{recommendation}</h3>
        <p className="text-white/80 text-sm leading-relaxed max-w-2xl">{details}</p>
      </div>
    </div>
  );
}
