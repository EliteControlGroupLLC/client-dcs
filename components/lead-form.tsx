"use client";

import { useState } from "react";
import { AddressAutocompleteInput } from "@/components/property-scanner/address-autocomplete-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField, FormAlert } from "@/components/ui/form";
import { CheckCircle, ArrowRight } from "lucide-react";

// Fields, labels, inline errors and the error box come from the sitewide form
// primitives (components/ui/form.tsx), so this form matches the lead gate.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "address", string>>;

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
    address: "",
    project: "ADU",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nextErrors: FieldErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Please enter your name.";
    if (!EMAIL_RE.test(formData.email.trim())) nextErrors.email = "Please enter a valid email address.";
    if (formData.phone.replace(/\D/g, "").length < 10) nextErrors.phone = "Please enter a valid phone number.";
    // An ad lead with no address can't be quoted or even located.
    if (formData.address.trim().length < 8 || !/\d/.test(formData.address))
      nextErrors.address = "Please pick your project address from the list.";
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
          property_address: formData.address,
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
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
        <p className="text-white/80">
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
        <h3 className={`font-semibold text-white ${compact ? "text-lg" : "text-xl"}`}>
          {heading}
        </h3>
      )}
      <FormField tone="dark" label="Full name" htmlFor={`${idPrefix}-name`} error={fieldErrors.name}>
        <Input
          tone="dark"
          id={`${idPrefix}-name`}
          autoComplete="name"
          value={formData.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Jane Smith"
          invalid={!!fieldErrors.name}
        />
      </FormField>
      <FormField tone="dark" label="Email" htmlFor={`${idPrefix}-email`} error={fieldErrors.email}>
        <Input
          tone="dark"
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
          invalid={!!fieldErrors.email}
        />
      </FormField>
      <FormField tone="dark" label="Phone" htmlFor={`${idPrefix}-phone`} error={fieldErrors.phone}>
        <Input
          tone="dark"
          id={`${idPrefix}-phone`}
          type="tel"
          autoComplete="tel"
          value={formData.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="(619) 555-0123"
          invalid={!!fieldErrors.phone}
        />
      </FormField>
      <FormField
        tone="dark"
        label="Project address"
        htmlFor={`${idPrefix}-address`}
        error={fieldErrors.address}
      >
        <AddressAutocompleteInput
          id={`${idPrefix}-address`}
          compact
          invalid={!!fieldErrors.address}
          value={formData.address}
          onChange={(value) => update("address", value)}
          onSelect={(value) => update("address", value)}
          placeholder="1015 Monterrey Ct, Chula Vista"
        />
      </FormField>
      <FormField tone="dark" label="Project type" htmlFor={`${idPrefix}-project`}>
        <Select
          tone="dark"
          id={`${idPrefix}-project`}
          value={formData.project}
          onChange={(e) => update("project", e.target.value)}
        >
          <option value="ADU">ADU / Guest House</option>
          <option value="Custom Homes">Custom Homes</option>
          <option value="Remodel">Home Remodeling</option>
          <option value="Garage Conversion">Garage Conversion</option>
          <option value="Other">Other</option>
        </Select>
      </FormField>
      <FormAlert tone="dark">{error}</FormAlert>
      <Button type="submit" size="lg" rounded="full" className="w-full group" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : buttonText}
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
      <p className="text-xs text-center text-white/75">
        No obligation. We&apos;ll never share your info.
      </p>
    </form>
  );
}
