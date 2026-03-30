"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ArrowRight } from "lucide-react";

interface LeadFormProps {
  source: string;
  heading?: string;
  buttonText?: string;
  compact?: boolean;
}

export function LeadForm({
  source,
  heading = "Get Your Free Quote",
  buttonText = "Get My Free Quote",
  compact = false,
}: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    project: "ADU",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    // Track conversion event
    if (typeof window !== "undefined") {
      // GTM event
      const w = window as Window & { dataLayer?: Record<string, unknown>[] };
      if (w.dataLayer) {
        w.dataLayer.push({
          event: "lead_form_submit",
          form_source: source,
          project_type: formData.project,
        });
      }
      // Meta Pixel event
      const fb = window as Window & { fbq?: (...args: unknown[]) => void };
      if (fb.fbq) {
        fb.fbq("track", "Lead", {
          content_name: source,
          content_category: formData.project,
        });
      }
    }
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service_type: formData.project,
          source,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "We could not submit your request right now.");
      }
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not submit your request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-secondary mb-2">Thank You!</h3>
        <p className="text-muted-foreground">
          We&apos;ll call you within 24 hours to discuss your project.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      {heading && (
        <h3 className={`font-bold text-secondary ${compact ? "text-lg" : "text-xl"}`}>
          {heading}
        </h3>
      )}
      <Input
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Your Name"
        className="bg-white"
      />
      <Input
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email Address"
        className="bg-white"
      />
      <Input
        type="tel"
        required
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Phone Number"
        className="bg-white"
      />
      <select
        value={formData.project}
        onChange={(e) => setFormData({ ...formData, project: e.target.value })}
        className="w-full h-12 px-4 rounded-xl border border-input bg-white text-base"
      >
        <option value="ADU">ADU / Guest House</option>
        <option value="Custom Homes">Custom Homes</option>
        <option value="Remodel">Home Remodeling</option>
        <option value="Garage Conversion">Garage Conversion</option>
        <option value="Other">Other</option>
      </select>
      <Button type="submit" size="lg" className="w-full group">
        {isSubmitting ? "Submitting..." : buttonText}
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
      {error && <p className="text-xs text-center text-destructive">{error}</p>}
      <p className="text-xs text-center text-muted-foreground">
        No obligation. We&apos;ll never share your info.
      </p>
    </form>
  );
}
