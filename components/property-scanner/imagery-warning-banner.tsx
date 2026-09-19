"use client";

import { AlertTriangle } from "lucide-react";

interface ImageryWarningBannerProps {
  message: string;
}

export function ImageryWarningBanner({ message }: ImageryWarningBannerProps) {
  return (
    <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl px-5 py-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-200 leading-relaxed">{message}</p>
    </div>
  );
}
