"use client";

import { usePathname } from "next/navigation";

/**
 * Ad landing pages (/lp/*) ship their own minimal logo header + footer
 * (app/lp/layout.tsx) and must not show the site navigation, footer or the
 * floating Instant Estimate button.
 */
export function isLandingPage(pathname: string | null | undefined): boolean {
  return !!pathname && (pathname === "/lp" || pathname.startsWith("/lp/"));
}

/** Renders its children everywhere except on landing pages. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isLandingPage(pathname)) return null;
  return <>{children}</>;
}
