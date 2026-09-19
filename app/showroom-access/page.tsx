import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Box, Layers, Palette, Sparkles, Tag } from "lucide-react";
import { LeadGate } from "@/components/lead-gate/lead-gate";
import { LEAD_GATE_INTERESTS, SHOWROOM_OFFER } from "@/lib/lead-gate-interests";
import { getLeadPassFromCookies, isLeadPassConfigured } from "@/lib/lead-pass";
import { safeShowroomNext } from "@/lib/showroom-access";
import { ShowroomRedirect } from "./showroom-redirect";

export const metadata: Metadata = {
  title: "Shop the Showroom — Unlock up to 30% off | TruthCore",
  description:
    "Shop cabinetry, countertops, flooring, fixtures and finishes in the TruthCore showroom. Unlock up to 30% off.",
  alternates: { canonical: "/showroom-access" },
};

const highlights = [
  { icon: Box, title: "Cabinetry & Fixtures", text: "Kitchen and bath cabinetry, hardware and plumbing fixtures." },
  { icon: Sparkles, title: "Countertops & Tile", text: "Quartz, granite, marble and tile for every room." },
  { icon: Layers, title: "Flooring", text: "Hardwood, luxury vinyl, tile and more." },
  { icon: Palette, title: "Finishes & AI 3D Design", text: "Visualize your space in 3D before you build." },
];

export default async function ShowroomAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const target = safeShowroomNext(Array.isArray(next) ? next[0] : next);

  // Already have a lead pass → straight into the store (the showroom route
  // registers the showroom lead, deduped 24h). If passes can't be signed on
  // this deployment the showroom isn't gated either.
  if (!isLeadPassConfigured() || (await getLeadPassFromCookies())) {
    redirect(target);
  }

  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary-light font-semibold text-sm uppercase tracking-wider mb-4">
              TRUTHCORE SHOWROOM
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Shop the Showroom</h1>
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-base md:text-lg font-bold text-white shadow-lg shadow-primary/30">
                <Tag className="h-5 w-5" />
                {SHOWROOM_OFFER}
              </span>
            </div>
            <p className="text-lg md:text-xl text-white/80">
              Browse the cabinetry, countertops, flooring, fixtures and finishes we install every day —
              and unlock up to 30% off your selections when you register below.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="h-full rounded-2xl bg-white/5 border border-white/10 p-6">
                <Icon className="h-5 w-5 text-primary-light mb-3" />
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-white/70">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LeadGate
        interest={LEAD_GATE_INTERESTS.showroom}
        headline="Unlock up to 30% off in our showroom"
        subhead="Register once to shop the full showroom and lock in your discount."
        offerBadge={SHOWROOM_OFFER}
        ctaLabel="Unlock up to 30% off"
        bullets={[
          "Up to 30% off showroom materials & finishes",
          "Full access to cabinetry, countertops, flooring & fixtures",
          "AI 3D design to visualize your space",
          "No spam, no obligation",
        ]}
      >
        <ShowroomRedirect to={target} />
      </LeadGate>
    </div>
  );
}
