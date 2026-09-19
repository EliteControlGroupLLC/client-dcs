import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/data/site-data";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              LEGAL
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl text-white/80">Last updated: March 2026</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary border-t border-white/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-white mb-4">Acceptance of Terms</h2>
          <p className="text-white/80 leading-relaxed mb-8">
            By accessing and using the TruthCore website, operated by Distinct Construction Solutions, you accept and agree to be
            bound by these Terms of Service. If you do not agree, please do not use our website.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4">Use of Website</h2>
          <p className="text-white/80 leading-relaxed mb-8">
            This website is provided for informational purposes and to facilitate communication about our
            construction services. All content, including text, images, and tools, is owned by Distinct
            Construction Solutions and is protected by copyright law.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4">Project Estimates</h2>
          <p className="text-white/80 leading-relaxed mb-8">
            Any estimates, pricing information, or project timelines provided on this website are approximate
            and for informational purposes only. Actual project costs and timelines are determined through our
            formal consultation and contract process.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4">Interactive Tools</h2>
          <p className="text-white/80 leading-relaxed mb-8">
            Our interactive tools, including the ADU builder and cost calculator, provide estimates based on
            general parameters. Results should not be considered as formal quotes or guarantees. A detailed
            consultation is required for accurate project pricing.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
          <p className="text-white/80 leading-relaxed mb-8">
            Distinct Construction Solutions is not liable for any damages arising from the use of this website
            or reliance on information provided herein. Our website is provided &quot;as is&quot; without
            warranties of any kind.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4">Licensing</h2>
          <p className="text-white/80 leading-relaxed mb-8">
            Distinct Construction Solutions, dba TruthCore, is a licensed California General Contractor. CSLB License #1098531.
            Bonded and insured. Serving San Diego County.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
          <p className="text-white/80 leading-relaxed mb-8">
            For questions about these terms, contact us at:<br />
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-accent underline-offset-4 hover:text-accent-light hover:underline">
              {COMPANY_INFO.email}
            </a><br />
            <a href={`tel:${COMPANY_INFO.phoneHref}`} className="text-accent underline-offset-4 hover:text-accent-light hover:underline">
              {COMPANY_INFO.phone}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
