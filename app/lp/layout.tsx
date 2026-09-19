import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { COMPANY_INFO } from "@/lib/data/site-data";

// Ad landing pages use their own minimal logo header + footer (no navigation,
// better for conversions). The global site Header, Footer and floating Instant
// Estimate button render nothing on /lp/* (see components/layout/site-chrome.tsx).
export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-lp-root>
      {/* Minimal header — logo only, no navigation (better for ad conversions) */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex h-20 items-center">
            <Link href="/" aria-label="TruthCore — Home" className="inline-flex items-center">
              {/* Same logo size as the main site header */}
              <Logo variant="light" className="h-[22px] sm:h-[26px] w-auto" />
            </Link>
          </div>
        </div>
      </header>
      {children}
      {/* Minimal footer */}
      <footer className="bg-secondary border-t border-white/10 py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-white/70 text-sm">
            © {new Date().getFullYear()} TruthCore, a DBA of {COMPANY_INFO.name}. Licensed & Bonded. San Diego, CA.
          </p>
          <div className="flex justify-center gap-6 mt-2 text-sm text-white/60">
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
