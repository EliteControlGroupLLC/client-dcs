import { Sparkles } from "lucide-react";

interface SmartRecommendationBannerProps {
  recommendation: string;
  details: string;
}

export function SmartRecommendationBanner({ recommendation, details }: SmartRecommendationBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary to-secondary-light p-8 text-white animate-slide-up" style={{ animationDelay: "0.3s" }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Smart Recommendation</p>
            <p className="text-xs text-white/40">Based on your property scan</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-2">{recommendation}</h3>
        <p className="text-white/70 text-sm leading-relaxed max-w-2xl">{details}</p>
      </div>
    </div>
  );
}
