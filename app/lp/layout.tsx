import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { COMPANY_INFO } from "@/lib/data/site-data";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Minimal header — logo only, no navigation (better for ad conversions) */}
      <header className="absolute top-0 left-0 right-0 z-50 py-4">
        <div className="container mx-auto px-4">
          <Link href="/" aria-label="TruthCore — Home" className="inline-block">
            <Logo variant="light" className="h-6 w-auto" />
          </Link>
        </div>
      </header>
      {children}
      {/* Minimal footer */}
      <footer className="bg-secondary py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} TruthCore, a DBA of {COMPANY_INFO.name}. Licensed & Bonded. San Diego, CA.
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-white/30">
            <Link href="/privacy" className="hover:text-white/60">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/60">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
