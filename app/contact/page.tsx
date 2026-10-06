"use client";

import { useEffect, useRef, useState } from "react";
import { AddressAutocompleteInput } from "@/components/property-scanner/address-autocomplete-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Loader2,
  Send,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField, FormAlert } from "@/components/ui/form";
import { HoneypotField } from "@/components/lead-gate/honeypot-field";
import { PhoneCodeStep } from "@/components/lead-gate/phone-code-step";
import { useLeadVerification } from "@/components/lead-gate/use-lead-verification";
import { trackContactFormSubmitted } from "@/lib/analytics";
import { ELAPSED_FIELD, HONEYPOT_FIELD } from "@/lib/spam-fields";
import { COMPANY_INFO } from "@/lib/data/site-data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "address" | "message" | "code", string>>;

const serviceTypes = [
  "ADU / Accessory Dwelling Unit",
  "New Home Construction",
  "Home Remodeling",
  "Kitchen Renovation",
  "Bathroom Renovation",
  "Roofing",
  "Other",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"details" | "code">("details");
  const [code, setCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [honeypot, setHoneypot] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    service: "",
    message: "",
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

  // A visitor who has already given us these details doesn't type them again.
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
    // The form just filled itself in, so the visitor's clock starts now —
    // otherwise someone with nothing left to type trips the "too fast" bot
    // check simply by clicking submit.
    renderedAt.current = Date.now();
  }, [pass]);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!formData.name.trim()) errors.name = "Please enter your name.";
    if (!formData.email.trim()) errors.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(formData.email.trim())) errors.email = "Please enter a valid email address.";
    if (!formData.phone.trim()) errors.phone = "Please enter your phone number.";
    else if (formData.phone.replace(/\D/g, "").length < 10)
      errors.phone = "Please enter a valid 10-digit phone number.";
    if (formData.address.trim().length < 8 || !/\d/.test(formData.address))
      errors.address = "Please pick your project address from the list.";
    if (!formData.message.trim()) errors.message = "Please tell us a little about your project.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // `isRetry` stops the 403 recovery below from looping if the server keeps
  // refusing: we try once more, then surface the error.
  const sendMessage = async (phoneToken: string | null, isRetry = false) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phoneToken,
          [HONEYPOT_FIELD]: honeypot,
          [ELAPSED_FIELD]: Date.now() - renderedAt.current,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        // The server is the authority on verification; if it says the number
        // isn't proven, show the code step rather than a dead end. We may not
        // have sent a code yet (this path is reached when a lead pass turned
        // out to be stale), so send one before asking for it.
        if (result?.code === "PHONE_NOT_VERIFIED" && !isRetry) {
          const sent = await sendCode(formData.phone);
          if (sent.ok && sent.skipped) {
            // Verification is unavailable after all — retry with its token.
            await sendMessage(sent.phoneToken, true);
            return;
          }
          setStep("code");
          setFieldErrors({ code: sent.ok ? "" : sent.error });
          return;
        }
        throw new Error(result?.error || "We could not submit your request. Please try again.");
      }
      trackContactFormSubmitted(formData.service);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "We could not submit your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    // Returning visitor, or SMS verification unavailable — straight through.
    const started = await startVerification(formData.phone);
    if (started.status === "error") {
      setFieldErrors((prev) => ({ ...prev, phone: started.error }));
      return;
    }
    if (started.status === "ready") {
      await sendMessage(started.phoneToken);
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
    await sendMessage(result.phoneToken);
  };

  const handleResend = async () => {
    const sent = await sendCode(formData.phone);
    if (sent.ok && sent.skipped) {
      await sendMessage(sent.phoneToken);
      return;
    }
    setFieldErrors(sent.ok ? {} : { code: sent.error });
  };

  const update = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary">
        <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
                CONTACT
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Thank You!
              </h1>
              <p className="text-xl text-white/80 mb-8">
                We&apos;ve received your message and will get back to you within 24 hours.
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setStep("details");
                  setCode("");
                  setFieldErrors({});
                  setSubmitError(null);
                  // Restart the bot timer; the next message is a fresh form.
                  renderedAt.current = Date.now();
                  setFormData((prev) => ({ ...prev, service: "", message: "" }));
                }}
                size="lg"
                variant="outlineWhite"
                rounded="full"
                className="w-full sm:w-auto"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              CONTACT
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-white/80">
              Ready to start your project? Have questions? We&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary bg-[radial-gradient(ellipse_at_bottom,rgba(51,102,102,0.35),transparent_60%)] border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card tone="dark" className="transition-colors hover:border-accent/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Phone</h3>
                      <a href={`tel:${COMPANY_INFO.phoneHref}`} className="block text-accent-light hover:text-white transition-colors">{COMPANY_INFO.phone}</a>
                      <p className="text-sm text-white/75">Monday – Friday, 8:00 AM – 4:30 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card tone="dark" className="transition-colors hover:border-accent/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white">Email</h3>
                      <a href={`mailto:${COMPANY_INFO.email}`} className="block break-all text-accent-light hover:text-white transition-colors">{COMPANY_INFO.email}</a>
                      <p className="text-sm text-white/75">We reply within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card tone="dark" className="transition-colors hover:border-accent/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Office</h3>
                      <p className="text-white/80">{COMPANY_INFO.office}</p>
                      <p className="text-sm text-white/75">Serving all of San Diego County</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card tone="dark" className="transition-colors hover:border-accent/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Business Hours</h3>
                      <p className="text-white/80">Monday – Friday</p>
                      <p className="text-white/80">8:00 AM – 4:30 PM</p>
                      <p className="text-sm text-white/75">Saturday by appointment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card tone="dark" className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {step === "code" ? (
                  <PhoneCodeStep
                    phone={formData.phone}
                    code={code}
                    onCodeChange={setCode}
                    onSubmit={handleVerify}
                    onBack={() => {
                      setStep("details");
                      setCode("");
                      setFieldErrors({});
                      setSubmitError(null);
                    }}
                    onResend={handleResend}
                    resendCooldown={resendCooldown}
                    sending={sending}
                    verifying={verifying}
                    submitting={isSubmitting}
                    codeError={fieldErrors.code}
                    formError={submitError ?? undefined}
                    confirmLabel="Verify & Send Message"
                  />
                ) : (
                <form onSubmit={handleSubmit} className="relative space-y-4" noValidate>
                  <HoneypotField value={honeypot} onChange={setHoneypot} idSuffix="-contact" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField tone="dark" label="Full Name *" htmlFor="contact-name" error={fieldErrors.name}>
                      <Input
                        tone="dark"
                        id="contact-name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="John Smith"
                        invalid={!!fieldErrors.name}
                      />
                    </FormField>
                    <FormField tone="dark" label="Email *" htmlFor="contact-email" error={fieldErrors.email}>
                      <Input
                        tone="dark"
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="john@example.com"
                        invalid={!!fieldErrors.email}
                      />
                    </FormField>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      tone="dark"
                      label="Mobile Phone *"
                      htmlFor="contact-phone"
                      error={fieldErrors.phone}
                      hint={
                        alreadyVerified(formData.phone)
                          ? "Already verified — we won't text you another code."
                          : "We'll text you a one-time code to confirm it's really you."
                      }
                    >
                      <Input
                        tone="dark"
                        id="contact-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="(619) 555-0123"
                        invalid={!!fieldErrors.phone}
                      />
                    </FormField>
                    <FormField tone="dark" label="Service Interested In" htmlFor="contact-service">
                      <Select
                        tone="dark"
                        id="contact-service"
                        placeholder="Select a service..."
                        value={formData.service}
                        onChange={(e) => update("service", e.target.value)}
                      >
                        {serviceTypes.map((service) => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </Select>
                    </FormField>
                  </div>

                  <FormField
                    tone="dark"
                    label="Project Address *"
                    htmlFor="contact-address"
                    error={fieldErrors.address}
                    hint="Where the work would happen. Start typing and pick your address from the list."
                  >
                    <AddressAutocompleteInput
                      id="contact-address"
                      compact
                      invalid={!!fieldErrors.address}
                      value={formData.address}
                      onChange={(value) => update("address", value)}
                      onSelect={(value) => update("address", value)}
                      placeholder="1015 Monterrey Ct, Chula Vista"
                    />
                  </FormField>

                  <FormField tone="dark" label="Message *" htmlFor="contact-message" error={fieldErrors.message}>
                    <Textarea
                      tone="dark"
                      id="contact-message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Tell us about your project..."
                      invalid={!!fieldErrors.message}
                    />
                  </FormField>

                  <FormAlert tone="dark">{submitError}</FormAlert>

                  {/* Held until the lead-pass check resolves, so a returning
                      visitor isn't texted a code they don't need. */}
                  <Button
                    type="submit"
                    size="lg"
                    rounded="full"
                    className="w-full"
                    disabled={isSubmitting || sending || !passChecked}
                  >
                    {isSubmitting || sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {sending ? "Sending code..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="flex items-center justify-center gap-1.5 text-xs text-white/75">
                    <Shield className="h-3.5 w-3.5 text-accent" />
                    Secure SMS verification — one code, that&apos;s it.
                  </p>

                  <p className="text-xs text-center text-white/75">
                    By submitting this form, you agree to our{" "}
                    <a href="/privacy" className="text-accent-light underline underline-offset-2 hover:text-white">privacy policy</a>. We&apos;ll never share your information.
                  </p>
                </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
