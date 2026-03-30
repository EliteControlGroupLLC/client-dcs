import Link from "next/link";
import { COMPANY_INFO } from "@/lib/data/site-data";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-white/80">Last updated: March 2026</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl prose prose-lg">
          <h2 className="text-2xl font-bold text-secondary mb-4">Information We Collect</h2>
          <p className="text-muted-foreground mb-6">
            When you use our website or contact us, we may collect personal information such as your name,
            email address, phone number, and project details. We collect this information when you fill out
            forms, request a consultation, or communicate with us directly.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">How We Use Your Information</h2>
          <p className="text-muted-foreground mb-6">
            We use the information we collect to respond to your inquiries, provide project estimates,
            communicate about our services, and improve our website experience. We do not sell or share
            your personal information with third parties for marketing purposes.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Cookies & Analytics</h2>
          <p className="text-muted-foreground mb-6">
            Our website uses cookies and analytics tools to understand how visitors interact with our site.
            This helps us improve the user experience. You can control cookie settings through your browser preferences.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Data Security</h2>
          <p className="text-muted-foreground mb-6">
            We implement appropriate security measures to protect your personal information against unauthorized
            access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Your Rights</h2>
          <p className="text-muted-foreground mb-6">
            You have the right to access, correct, or delete your personal information. To exercise these rights,
            please contact us at{" "}
            <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
              {COMPANY_INFO.email}
            </a>.
          </p>

          <h2 className="text-2xl font-bold text-secondary mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-6">
            If you have questions about this Privacy Policy, please contact us at:<br />
            {COMPANY_INFO.name}<br />
            {COMPANY_INFO.office}<br />
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
