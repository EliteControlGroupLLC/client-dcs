"use client";

// <LeadGate> — the interactive part of a tool (or the showroom) stays locked
// until the visitor submits their contact info + verifies their phone by SMS.
// Visitors who already hold a lead pass (httpOnly cookie, 90 days) go straight
// through; a BuildCore lead is still registered for this interest (the API
// dedupes to one per interest per 24h).

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressAutocompleteInput } from "@/components/property-scanner/address-autocomplete-input";
import type { LeadGateInterest } from "@/lib/lead-gate-interests";
import { isValidPhoneFormat, usePhoneVerification } from "./use-phone-verification";

type GateStatus = "checking" | "locked" | "unlocked";
type FormStep = "details" | "code";

export interface LeadGateProps {
  interest: LeadGateInterest;
  headline: string;
  subhead?: string;
  /** Optional highlighted offer, e.g. "Unlock up to 30% off" */
  offerBadge?: string;
  /** Value bullets shown next to the form */
  bullets?: string[];
  /** Submit button label */
  ctaLabel?: string;
  /** Extra context sent with the lead (e.g. what the visitor was looking at) */
  details?: unknown;
  /** Called once the gate opens (new submit or existing pass) */
  onUnlocked?: () => void;
  children: ReactNode;
}

const DEFAULT_BULLETS = [
  "Instant, San Diego–specific pricing ranges",
  "One quick form unlocks every TruthCore planning tool",
  "Optional follow-up from a licensed TruthCore project expert",
  "No spam, no obligation",
];

// One interest registration per interest per page load (guards React strict
// mode double-mounts; the server dedupes across loads).
const registeredThisLoad = new Set<string>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (invalid: boolean) =>
  `w-full h-11 px-3 rounded-lg border bg-white text-sm text-secondary placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
    invalid ? "border-red-400 bg-red-50" : "border-border"
  }`;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-600 mt-1 flex items-center gap-1" role="alert">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

function GateSkeleton() {
  return (
    <section className="py-20" data-lead-gate="checking" aria-busy="true">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="rounded-2xl border border-border bg-white shadow-sm p-6 md:p-8 animate-pulse">
          <div className="h-5 w-40 rounded bg-muted mb-4" />
          <div className="h-8 w-3/4 max-w-md rounded bg-muted mb-6" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="h-11 rounded-lg bg-muted" />
            <div className="h-11 rounded-lg bg-muted" />
            <div className="h-11 rounded-lg bg-muted sm:col-span-2" />
          </div>
          <span className="sr-only">Loading…</span>
        </div>
      </div>
    </section>
  );
}

export function LeadGate({
  interest,
  headline,
  subhead,
  offerBadge,
  bullets = DEFAULT_BULLETS,
  ctaLabel = "Unlock Now",
  details,
  onUnlocked,
  children,
}: LeadGateProps) {
  const [status, setStatus] = useState<GateStatus>("checking");
  const [step, setStep] = useState<FormStep>("details");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { sendCode, verifyCode, sending, verifying, resendCooldown } = usePhoneVerification();

  const onUnlockedRef = useRef(onUnlocked);
  onUnlockedRef.current = onUnlocked;
  const detailsRef = useRef(details);
  detailsRef.current = details;

  // Check for an existing lead pass.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/lead-gate", { cache: "no-store" });
        const data = (await res.json()) as { hasPass?: boolean };
        if (cancelled) return;
        if (data.hasPass) {
          setStatus("unlocked");
          onUnlockedRef.current?.();
          if (!registeredThisLoad.has(interest.key)) {
            registeredThisLoad.add(interest.key);
            // Fire-and-forget: the tool renders immediately.
            void fetch("/api/lead-gate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ interest, details: detailsRef.current, pageUrl: window.location.href }),
            }).catch(() => {});
          }
        } else {
          setStatus("locked");
        }
      } catch {
        if (!cancelled) setStatus("locked");
      }
    })();
    return () => {
      cancelled = true;
    };
    // interest is a stable constant per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interest.key]);

  const validateFields = (): boolean => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Please enter a valid email address";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (!isValidPhoneFormat(phone)) e.phone = "Please enter a valid 10-digit phone number";
    if (!address.trim()) e.address = "Property address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Server-side deliverability / disposable check. Only a definitive "invalid"
  // blocks; if the checker itself is down we let the visitor continue.
  const checkEmail = async (): Promise<boolean> => {
    setCheckingEmail(true);
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) return true;
      const data = (await res.json()) as { valid?: boolean; reason?: string };
      if (data.valid === false) {
        setErrors((p) => ({ ...p, email: data.reason || "Please use a valid email address" }));
        return false;
      }
      return true;
    } catch {
      return true;
    } finally {
      setCheckingEmail(false);
    }
  };

  const submitLead = async (phoneToken: string | null) => {
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/lead-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          propertyAddress: address.trim(),
          phoneToken,
          interest,
          details: detailsRef.current,
          pageUrl: window.location.href,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      if (!res.ok) {
        if (data.code === "PHONE_NOT_VERIFIED") {
          setStep("code");
          setErrors({ code: data.error || "Please verify your phone number." });
        } else {
          setErrors({ form: data.error || "Something went wrong. Please try again." });
        }
        return;
      }
      registeredThisLoad.add(interest.key);
      setStatus("unlocked");
      onUnlockedRef.current?.();
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetailsSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateFields()) return;
    if (!(await checkEmail())) return;
    const sent = await sendCode(phone);
    if (!sent.ok) {
      setErrors((p) => ({ ...p, phone: sent.error }));
      return;
    }
    if (sent.skipped) {
      // SMS verification isn't configured on this deployment — submit as unverified.
      await submitLead(null);
      return;
    }
    setCode("");
    setStep("code");
  };

  const handleVerify = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const result = await verifyCode(phone, code);
    if (!result.ok) {
      setErrors({ code: result.error });
      return;
    }
    await submitLead(result.phoneToken);
  };

  const handleResend = async () => {
    const sent = await sendCode(phone);
    setErrors(sent.ok ? {} : { code: sent.error });
  };

  if (status === "checking") return <GateSkeleton />;
  if (status === "unlocked") return <>{children}</>;

  const busyDetails = checkingEmail || sending || submitting;

  return (
    <section className="py-20" data-lead-gate="locked">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="rounded-2xl border-2 border-primary/30 bg-white shadow-2xl overflow-hidden grid lg:grid-cols-5">
          {/* Value panel */}
          <div className="lg:col-span-2 bg-gradient-to-br from-secondary to-secondary-light text-white p-6 md:p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-5">
              <Lock className="h-6 w-6 text-primary-light" />
            </div>
            {offerBadge && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-primary/30">
                  <Sparkles className="h-4 w-4" />
                  {offerBadge}
                </span>
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3">{headline}</h2>
            {subhead && <p className="text-sm md:text-base text-white/80 mb-6">{subhead}</p>}
            <ul className="space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-white/90">
                  <CheckCircle className="h-4 w-4 text-primary-light mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-white/60">Takes about 60 seconds. We&apos;ll text you a one-time code.</p>
          </div>

          {/* Form panel */}
          <div className="lg:col-span-3 p-6 md:p-8">
            {step === "details" ? (
              <form onSubmit={handleDetailsSubmit} className="space-y-4" noValidate>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">Step 1 of 2</p>
                  <h3 className="text-xl font-semibold text-secondary">Tell us where to send your results</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lg-first" className="block text-xs font-medium text-muted-foreground mb-1.5">
                      <User className="h-3 w-3 inline mr-1" />
                      First Name *
                    </label>
                    <input
                      id="lg-first"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className={inputClass(!!errors.firstName)}
                    />
                    <FieldError message={errors.firstName} />
                  </div>
                  <div>
                    <label htmlFor="lg-last" className="block text-xs font-medium text-muted-foreground mb-1.5">
                      <User className="h-3 w-3 inline mr-1" />
                      Last Name *
                    </label>
                    <input
                      id="lg-last"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className={inputClass(!!errors.lastName)}
                    />
                    <FieldError message={errors.lastName} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lg-email" className="block text-xs font-medium text-muted-foreground mb-1.5">
                      <Mail className="h-3 w-3 inline mr-1" />
                      Email *
                    </label>
                    <input
                      id="lg-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className={inputClass(!!errors.email)}
                    />
                    <FieldError message={errors.email} />
                  </div>
                  <div>
                    <label htmlFor="lg-phone" className="block text-xs font-medium text-muted-foreground mb-1.5">
                      <Phone className="h-3 w-3 inline mr-1" />
                      Mobile Phone *
                    </label>
                    <input
                      id="lg-phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(619) 555-0123"
                      className={inputClass(!!errors.phone)}
                    />
                    <FieldError message={errors.phone} />
                  </div>
                </div>
                <div>
                  <label htmlFor="lg-address" className="block text-xs font-medium text-muted-foreground mb-1.5">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    Property Address *
                  </label>
                  <AddressAutocompleteInput
                    id="lg-address"
                    compact
                    invalid={!!errors.address}
                    value={address}
                    onChange={setAddress}
                    onSelect={setAddress}
                    placeholder="123 Main St, San Diego, CA"
                  />
                  <FieldError message={errors.address} />
                </div>

                {errors.form && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{errors.form}</p>
                  </div>
                )}

                <Button type="submit" size="lg" rounded="full" className="w-full" disabled={busyDetails}>
                  {busyDetails ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {checkingEmail ? "Checking email…" : sending ? "Sending code…" : "Unlocking…"}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {ctaLabel}
                    </>
                  )}
                </Button>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    Secure SMS verification
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    No spam, ever
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    Your info stays with TruthCore
                  </span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4" noValidate>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">Step 2 of 2</p>
                  <h3 className="text-xl font-semibold text-secondary">Enter the code we texted you</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sent to <strong className="text-secondary">{phone}</strong>
                  </p>
                </div>
                <div>
                  <label htmlFor="lg-code" className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Verification Code
                  </label>
                  <input
                    id="lg-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit code"
                    className={`w-full px-4 py-3 rounded-lg border text-lg text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                      errors.code ? "border-red-400 bg-red-50" : "border-border"
                    }`}
                  />
                  <FieldError message={errors.code} />
                </div>

                {errors.form && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{errors.form}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  rounded="full"
                  className="w-full"
                  disabled={verifying || submitting || code.length < 4}
                >
                  {verifying || submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {verifying ? "Verifying…" : "Unlocking…"}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Verify &amp; Unlock
                    </>
                  )}
                </Button>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("details");
                      setCode("");
                      setErrors({});
                    }}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-secondary transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Use a different number
                  </button>
                  {resendCooldown > 0 ? (
                    <span className="text-muted-foreground">Resend code in {resendCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={sending}
                      className="text-primary-dark font-medium hover:underline disabled:opacity-50"
                    >
                      {sending ? "Sending…" : "Didn't get it? Resend code"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
