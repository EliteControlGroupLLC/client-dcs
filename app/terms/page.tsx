import { COMPANY_INFO } from "@/lib/data/site-data";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-white/80">Last updated: March 2026</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl prose prose-lg">
          <h2 className="text-2xl font-bold text-secondary mb-4">Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-6">
            By accessing and using the Distinct Construction Solutions website, you accept and agree to be
            bound by these Terms of Service. If you do not agree, please do not use our website.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Use of Website</h2>
          <p className="text-muted-foreground mb-6">
            This website is provided for informational purposes and to facilitate communication about our
            construction services. All content, including text, images, and tools, is owned by Distinct
            Construction Solutions and is protected by copyright law.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Project Estimates</h2>
          <p className="text-muted-foreground mb-6">
            Any estimates, pricing information, or project timelines provided on this website are approximate
            and for informational purposes only. Actual project costs and timelines are determined through our
            formal consultation and contract process.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Interactive Tools</h2>
          <p className="text-muted-foreground mb-6">
            Our interactive tools, including the ADU builder and cost calculator, provide estimates based on
            general parameters. Results should not be considered as formal quotes or guarantees. A detailed
            consultation is required for accurate project pricing.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Limitation of Liability</h2>
          <p className="text-muted-foreground mb-6">
            Distinct Construction Solutions is not liable for any damages arising from the use of this website
            or reliance on information provided herein. Our website is provided &quot;as is&quot; without
            warranties of any kind.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Licensing</h2>
          <p className="text-muted-foreground mb-6">
            Distinct Construction Solutions is a licensed California General Contractor. CSLB License #1098531.
            Bonded and insured. Serving San Diego County.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Contact</h2>
          <p className="text-muted-foreground mb-6">
            For questions about these terms, contact us at:<br />
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a><br />
            <a href={`tel:${COMPANY_INFO.phoneHref}`} className="text-primary hover:underline">
              {COMPANY_INFO.phone}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
