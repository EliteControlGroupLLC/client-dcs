"use client";

import { useState } from "react";
import { FileText, User, Mail, Phone, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadCaptureFormProps {
  propertyAddress: string;
  scanResults: Record<string, unknown>;
  onReportGenerated?: (reportData: Record<string, unknown>) => void;
}

export function LeadCaptureForm({
  propertyAddress,
  scanResults,
  onReportGenerated,
}: LeadCaptureFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/property-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          propertyAddress,
          scanResults,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      if (onReportGenerated && data.report) {
        onReportGenerated(data.report);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-primary/5 via-white to-emerald-50 rounded-2xl border border-primary/20 p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4">
          <CheckCircle className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-secondary mb-2">Your Report is Ready!</h3>
        <p className="text-sm text-muted-foreground mb-1">
          We&apos;ve sent your Property Development Report to <strong>{email}</strong>.
        </p>
        <p className="text-xs text-muted-foreground">
          A DCS specialist will follow up to discuss your property&apos;s potential.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 via-white to-blue-50 rounded-2xl border border-primary/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-secondary-light text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Your Property Development Report is Ready</h3>
            <p className="text-sm text-white/70">Get your personalized report with full analysis</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              <User className="h-3 w-3 inline mr-1" />
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              <Mail className="h-3 w-3 inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            <Phone className="h-3 w-3 inline mr-1" />
            Phone Number (optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(619) 555-0123"
            className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          rounded="full"
          className="w-full"
          disabled={submitting || !name.trim() || !email.trim()}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Get My Free Property Report
            </>
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          By submitting, you agree to receive your report and a follow-up from our team.
          No spam, ever. Your data is secure.
        </p>
      </form>

      {/* Report includes */}
      <div className="px-6 pb-6">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Your report includes:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              "Property Summary",
              "Jurisdiction Rules",
              "ADU Feasibility",
              "Parcel Analysis",
              "Financial Projections",
              "ROI Snapshot",
              "Opportunity Analysis",
              "Next Steps & CTA",
            ].map((item) => (
              <p key={item} className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="w-1 h-1 bg-primary rounded-full" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
