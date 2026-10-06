"use client";

import { useEffect, useRef, useState } from "react";
import { AddressAutocompleteInput } from "@/components/property-scanner/address-autocomplete-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField, FormAlert } from "@/components/ui/form";
import { HoneypotField } from "@/components/lead-gate/honeypot-field";
import { PhoneCodeStep } from "@/components/lead-gate/phone-code-step";
import { useLeadVerification } from "@/components/lead-gate/use-lead-verification";
import { ELAPSED_FIELD, HONEYPOT_FIELD } from "@/lib/spam-fields";
import { CheckCircle, ArrowRight, Loader2, Shield } from "lucide-react";

// Fields, labels, inline errors and the error box come from the sitewide form
// primitives (components/ui/form.tsx), so this form matches the lead gate.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "address" | "code", string>>;

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
  const [step, setStep] = useState<"details" | "code">("details");
  const [code, setCode] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    project: "ADU",
  });

  // When the form appeared. A submit that beats MIN_FILL_MS is a bot.
  const renderedAt = useRef(Date.now());
  const prefilled = useRef(false);

  const {
    pass,
    passChecked,
    alreadyVerified,
    startVerification,
    verifyCode,
    sendCode,
    sending,
    verifying,
    resendCooldown,
  } = useLeadVerification();

  // Someone who already gave us their details doesn't retype them.
  useEffect(() => {
    if (!pass || prefilled.current) return;
    prefilled.current = true;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || [pass.firstName, pass.lastName].filter(Boolean).join(" "),
      email: prev.email || pass.email,
      phone: prev.phone || pass.phone,
      address: prev.address || pass.propertyAddress,
    }));
    // Every field just filled itself in and `project` already has a default,
    // so there is genuinely nothing left to type — restart the clock or this
    // visitor trips the "too fast" bot check by clicking submit.
    renderedAt.current = Date.now();
  }, [pass]);

  // Fired only once the lead is actually in BuildCore — a half-finished or
  // rejected submission is not a conversion.
  const trackConversion = () => {
    if (typeof window === "undefined") return;
    const w = window as Window & { dataLayer?: Record<string, unknown>[] };
    if (w.dataLayer) {
      w.dataLayer.push({
        event: "lead_form_submit",
        form_source: source,
        project_type: formData.project,
      });
    }
    const fb = window as Window & { fbq?: (...args: unknown[]) => void };
    if (fb.fbq) {
      fb.fbq("track", "Lead", {
        content_name: source,
        content_category: formData.project,
      });
    }
  };

  // `isRetry` stops the 403 recovery below from looping if the server keeps
  // refusing: we try once more, then surface the error.
  const submitLead = async (phoneToken: string | null, isRetry = false) => {
    setIsSubmitting(true);
    setError(null);
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
          phoneToken,
          [HONEYPOT_FIELD]: honeypot,
          [ELAPSED_FIELD]: Date.now() - renderedAt.current,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        // We may not have sent a code yet (this path is reached when a lead
        // pass turned out to be stale), so send one before asking for it.
        if (result?.code === "PHONE_NOT_VERIFIED" && !isRetry) {
          const sent = await sendCode(formData.phone);
          if (sent.ok && sent.skipped) {
            await submitLead(sent.phoneToken, true);
            return;
          }
          setStep("code");
          setFieldErrors({ code: sent.ok ? "" : sent.error });
          return;
        }
        throw new Error(result?.error || "We could not submit your request right now.");
      }
      trackConversion();
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not submit your request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

    const started = await startVerification(formData.phone);
    if (started.status === "error") {
      setFieldErrors((prev) => ({ ...prev, phone: started.error }));
      return;
    }
    if (started.status === "ready") {
      await submitLead(started.phoneToken);
      return;
    }
    setCode("");
    setFieldErrors({});
    setStep("code");
  };

  const handleVerify = async () => {
    const result = await verifyCode(formData.phone, code);
    if (!result.ok) {
      setFieldErrors({ code: result.error });
      return;
    }
    await submitLead(result.phoneToken);
  };

  const handleResend = async () => {
    const sent = await sendCode(formData.phone);
    if (sent.ok && sent.skipped) {
      await submitLead(sent.phoneToken);
      return;
    }
    setFieldErrors(sent.ok ? {} : { code: sent.error });
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

  if (step === "code") {
    return (
      <div className={compact ? "space-y-3" : "space-y-4"}>
        {heading && (
          <h3 className={`font-semibold text-white ${compact ? "text-lg" : "text-xl"}`}>{heading}</h3>
        )}
        <PhoneCodeStep
          phone={formData.phone}
          code={code}
          onCodeChange={setCode}
          onSubmit={handleVerify}
          onBack={() => {
            setStep("details");
            setCode("");
            setFieldErrors({});
            setError(null);
          }}
          onResend={handleResend}
          resendCooldown={resendCooldown}
          sending={sending}
          verifying={verifying}
          submitting={isSubmitting}
          codeError={fieldErrors.code}
          formError={error ?? undefined}
          confirmLabel={buttonText}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`relative ${compact ? "space-y-3" : "space-y-4"}`}>
      <HoneypotField value={honeypot} onChange={setHoneypot} idSuffix={`-${source}`} />
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
      <FormField
        tone="dark"
        label="Mobile Phone"
        htmlFor={`${idPrefix}-phone`}
        error={fieldErrors.phone}
        hint={
          alreadyVerified(formData.phone)
            ? "Already verified — no second code."
            : "We'll text you a one-time code."
        }
      >
        <Input
          tone="dark"
          id={`${idPrefix}-phone`}
          type="tel"
          inputMode="tel"
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
      <Button
        type="submit"
        size="lg"
        rounded="full"
        className="w-full group"
        /* Held until the lead-pass check resolves, so a returning visitor
           isn't texted a code they don't need. */
        disabled={isSubmitting || sending || !passChecked}
      >
        {isSubmitting || sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {sending ? "Sending code..." : "Submitting..."}
          </>
        ) : (
          <>
            {buttonText}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-white/75">
        <Shield className="h-3.5 w-3.5 text-accent" />
        Secure SMS verification. No obligation, and we&apos;ll never share your info.
      </p>
    </form>
  );
}
