"use client";

import { AlertTriangle } from "lucide-react";

interface ImageryWarningBannerProps {
  message: string;
}

export function ImageryWarningBanner({ message }: ImageryWarningBannerProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-700 leading-relaxed">{message}</p>
    </div>
  );
}
