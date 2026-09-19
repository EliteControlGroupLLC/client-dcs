"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, AlertCircle } from "lucide-react";

// Field + error styling mirrors the lead-gate form (components/lead-gate).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (invalid: boolean) =>
  `w-full h-11 px-3 rounded-lg border bg-white text-sm text-secondary placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
    invalid ? "border-red-400 bg-red-50" : "border-border"
  }`;

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";

type FieldErrors = Partial<Record<"name" | "email" | "phone", string>>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-600 mt-1 flex items-center gap-1" role="alert">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
    const nextErrors: FieldErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Please enter your name.";
    if (!EMAIL_RE.test(formData.email.trim())) nextErrors.email = "Please enter a valid email address.";
    if (formData.phone.replace(/\D/g, "").length < 10) nextErrors.phone = "Please enter a valid phone number.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
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
        <h3 className="text-xl font-semibold text-secondary mb-2">Thank You!</h3>
        <p className="text-muted-foreground">
          We&apos;ll call you within 24 hours to discuss your project.
        </p>
      </div>
    );
  }

  const update = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field in fieldErrors) setFieldErrors({ ...fieldErrors, [field]: undefined });
  };

  const idPrefix = `lf-${source}`;

  return (
    <form onSubmit={handleSubmit} noValidate className={compact ? "space-y-3" : "space-y-4"}>
      {heading && (
        <h3 className={`font-semibold text-secondary ${compact ? "text-lg" : "text-xl"}`}>
          {heading}
        </h3>
      )}
      <div>
        <label htmlFor={`${idPrefix}-name`} className={labelClass}>Full name</label>
        <input
          id={`${idPrefix}-name`}
          autoComplete="name"
          value={formData.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Jane Smith"
          aria-invalid={!!fieldErrors.name}
          className={inputClass(!!fieldErrors.name)}
        />
        <FieldError message={fieldErrors.name} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-email`} className={labelClass}>Email</label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
          aria-invalid={!!fieldErrors.email}
          className={inputClass(!!fieldErrors.email)}
        />
        <FieldError message={fieldErrors.email} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-phone`} className={labelClass}>Phone</label>
        <input
          id={`${idPrefix}-phone`}
          type="tel"
          autoComplete="tel"
          value={formData.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="(619) 555-0123"
          aria-invalid={!!fieldErrors.phone}
          className={inputClass(!!fieldErrors.phone)}
        />
        <FieldError message={fieldErrors.phone} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-project`} className={labelClass}>Project type</label>
        <select
          id={`${idPrefix}-project`}
          value={formData.project}
          onChange={(e) => update("project", e.target.value)}
          className={inputClass(false)}
        >
          <option value="ADU">ADU / Guest House</option>
          <option value="Custom Homes">Custom Homes</option>
          <option value="Remodel">Home Remodeling</option>
          <option value="Garage Conversion">Garage Conversion</option>
          <option value="Other">Other</option>
        </select>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <Button type="submit" size="lg" rounded="full" className="w-full group" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : buttonText}
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        No obligation. We&apos;ll never share your info.
      </p>
    </form>
  );
}
