"use client";

import { useState, useEffect } from "react";
import { Lock, User, Mail, Phone, MapPin, Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadCaptureFormProps {
  propertyAddress: string;
  scanResults: Record<string, unknown>;
  /** Server signature over scanResults from /api/analyze-property */
  reportToken?: string | null;
  onReportUnlocked?: () => void;
}

type VerificationStep = "form" | "phone-verify";

interface EmailValidationState {
  validated: boolean;
  valid: boolean;
  isDisposable: boolean;
  score: number;
  reason?: string;
}

interface PhoneVerificationState {
  codeSent: boolean;
  verified: boolean;
  token?: string;
  lastSentAt?: number;
}

// Same field + error styling as the site-wide lead gate (components/lead-gate).
const inputClass = (invalid: boolean, valid = false) =>
  `w-full h-11 px-3 rounded-lg border text-sm text-secondary placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
    invalid ? "border-red-400 bg-red-50" : valid ? "border-primary/40 bg-primary/5 pr-9" : "border-border bg-white"
  }`;

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-600 mt-1 flex items-center gap-1" role="alert">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

export function LeadCaptureForm({
  propertyAddress,
  scanResults,
  reportToken,
  onReportUnlocked,
}: LeadCaptureFormProps) {
  const [step, setStep] = useState<VerificationStep>("form");
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(propertyAddress);
  const [otpCode, setOtpCode] = useState("");
  
  // Validation states
  const [emailValidation, setEmailValidation] = useState<EmailValidationState | null>(null);
  const [phoneVerification, setPhoneVerification] = useState<PhoneVerificationState>({
    codeSent: false,
    verified: false,
  });
  
  // Loading states
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-fill address when propertyAddress changes
  useEffect(() => {
    setAddress(propertyAddress);
  }, [propertyAddress]);

  // Visitors who already registered through a lead gate (tools / showroom)
  // get their info pre-filled; if that phone was SMS-verified, no new code.
  const [passPhoneVerified, setPassPhoneVerified] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/lead-gate", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { hasPass?: boolean; firstName?: string; lastName?: string; email?: string; phone?: string; phoneVerified?: boolean }) => {
        if (cancelled || !d.hasPass) return;
        setFirstName((v) => v || d.firstName || "");
        setLastName((v) => v || d.lastName || "");
        setEmail((v) => v || d.email || "");
        setPhone((v) => v || d.phone || "");
        if (d.phoneVerified && d.phone) setPassPhoneVerified(d.phone.replace(/\D/g, "").slice(-10));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmailFormat = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhoneFormat = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
  };

  // Server-side email validation
  const validateEmailServer = async () => {
    if (!email.trim() || !validateEmailFormat(email.trim())) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return false;
    }

    setValidatingEmail(true);
    setErrors(prev => ({ ...prev, email: "" }));

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(prev => ({ ...prev, email: data.error || "Email validation failed" }));
        return false;
      }

      setEmailValidation({
        validated: true,
        valid: data.valid,
        isDisposable: data.isDisposable,
        score: data.score,
        reason: data.reason,
      });

      if (!data.valid) {
        setErrors(prev => ({ 
          ...prev, 
          email: data.reason || "Please use a valid email address to access your report" 
        }));
        return false;
      }

      return true;
    } catch {
      setErrors(prev => ({ ...prev, email: "Email validation failed. Please try again." }));
      return false;
    } finally {
      setValidatingEmail(false);
    }
  };

  // Send OTP - returns { success: boolean, skipped: boolean }
  const sendOtpCode = async (): Promise<{ success: boolean; skipped: boolean }> => {
    if (!phone.trim() || !validatePhoneFormat(phone.trim())) {
      setErrors(prev => ({ ...prev, phone: "Please enter a valid phone number" }));
      return { success: false, skipped: false };
    }

    setSendingOtp(true);
    setErrors(prev => ({ ...prev, phone: "", otp: "" }));

    try {
      const response = await fetch("/api/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: phone.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if phone verification is unavailable (Twilio not configured)
        if (data.error === "Phone verification is not available") {
          // Skip phone verification - submit directly
          return { success: true, skipped: true };
        }
        setErrors(prev => ({ ...prev, phone: data.error || "Failed to send code" }));
        return { success: false, skipped: false };
      }

      setPhoneVerification(prev => ({
        ...prev,
        codeSent: true,
        lastSentAt: Date.now(),
      }));
      setResendCooldown(30); // 30 second cooldown
      return { success: true, skipped: false };
    } catch {
      setErrors(prev => ({ ...prev, phone: "Failed to send code. Please try again." }));
      return { success: false, skipped: false };
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOtpCode = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrors(prev => ({ ...prev, otp: "Please enter the verification code" }));
      return false;
    }

    setVerifyingOtp(true);
    setErrors(prev => ({ ...prev, otp: "" }));

    try {
      const response = await fetch("/api/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone: phone.trim(), code: otpCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(prev => ({ ...prev, otp: data.error || "Invalid code" }));
        return false;
      }

      if (data.verified) {
        setPhoneVerification(prev => ({
          ...prev,
          verified: true,
          token: data.phoneToken || undefined,
        }));
        return (data.phoneToken as string | null) || true;
      }

      return false;
    } catch {
      setErrors(prev => ({ ...prev, otp: "Verification failed. Please try again." }));
      return false;
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Validate form fields
  const validateFormFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmailFormat(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhoneFormat(phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!address.trim()) {
      newErrors.address = "Property address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit lead without phone verification
  const submitLeadDirectly = async (phoneVerified: boolean = false) => {
    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/property-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          propertyAddress: address.trim(),
          scanResults,
          reportToken,
          verification: {
            emailValidated: emailValidation?.valid || false,
            emailScore: emailValidation?.score || 0,
            emailIsDisposable: emailValidation?.isDisposable || false,
            phoneVerified,
            verificationCompletedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || "Something went wrong. Please try again." });
        return;
      }

      if (onReportUnlocked) {
        onReportUnlocked();
      }
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form submission (Step 1: Validate fields + email, then move to phone verification)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormFields()) return;

    // Validate email server-side
    const emailValid = await validateEmailServer();
    if (!emailValid) return;

    // Phone already verified through a lead gate — no second code needed
    // (the server re-checks this against the signed lead-pass cookie).
    if (passPhoneVerified && phone.replace(/\D/g, "").slice(-10) === passPhoneVerified) {
      await submitLeadDirectly(true);
      return;
    }

    // Try to send OTP
    const otpResult = await sendOtpCode();
    
    if (!otpResult.success) return;
    
    // If phone verification is skipped (Twilio not configured), submit directly
    if (otpResult.skipped) {
      await submitLeadDirectly(false);
      return;
    }

    // Move to phone verification step
    setStep("phone-verify");
  };

  // Handle final submission after phone verification
  const handleVerifyAndUnlock = async () => {
    // Verify OTP
    const otpValid = await verifyOtpCode();
    if (!otpValid) return;
    const phoneToken = typeof otpValid === "string" ? otpValid : phoneVerification.token;

    // Submit the verified lead
    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/property-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          propertyAddress: address.trim(),
          scanResults,
          reportToken,
          // Verification data
          verification: {
            emailValidated: emailValidation?.valid || false,
            emailScore: emailValidation?.score || 0,
            emailIsDisposable: emailValidation?.isDisposable || false,
            phoneVerified: true,
            phoneToken,
            verificationCompletedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || "Something went wrong. Please try again." });
        return;
      }

      // Unlock the report
      if (onReportUnlocked) {
        onReportUnlocked();
      }
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // Render phone verification step
  if (step === "phone-verify") {
    return (
      <div className="bg-white rounded-2xl border-2 border-primary/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-secondary-light text-white p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4">
            <Phone className="h-6 w-6 text-primary-light" />
          </div>
          <h3 className="text-xl font-bold mb-2">Verify Your Phone Number</h3>
          <p className="text-sm text-white/80 max-w-md mx-auto">
            We sent a verification code to <strong>{phone}</strong>. Enter it below to unlock your report.
          </p>
        </div>

        {/* OTP Form */}
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="lcf-code" className={labelClass}>
              Verification Code
            </label>
            <input
              id="lcf-code"
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
              className={`w-full px-4 py-3 rounded-lg border text-lg text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                errors.otp ? "border-red-400 bg-red-50" : "border-border"
              }`}
            />
            <FieldError message={errors.otp} />
          </div>

          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.form}</p>
            </div>
          )}

          <Button
            type="button"
            size="lg"
            rounded="full"
            className="w-full"
            onClick={handleVerifyAndUnlock}
            disabled={verifyingOtp || submitting || otpCode.length < 4}
          >
            {verifyingOtp || submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {verifyingOtp ? "Verifying..." : "Unlocking Report..."}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Verify & Unlock Report
              </>
            )}
          </Button>

          {/* Resend option */}
          <div className="text-center">
            {resendCooldown > 0 ? (
              <p className="text-xs text-muted-foreground">
                Resend code in {resendCooldown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={sendOtpCode}
                disabled={sendingOtp}
                className="min-h-11 px-2 text-xs text-primary hover:underline disabled:opacity-50"
              >
                {sendingOtp ? "Sending..." : "Didn't receive the code? Resend"}
              </button>
            )}
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setOtpCode("");
              setPhoneVerification({ codeSent: false, verified: false });
            }}
            className="w-full min-h-11 text-xs text-muted-foreground hover:text-secondary transition-colors"
          >
            Use a different phone number
          </button>
        </div>
      </div>
    );
  }

  // Render initial form
  return (
    <div className="bg-white rounded-2xl border-2 border-primary/30 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-secondary-light text-white p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4">
          <Lock className="h-6 w-6 text-primary-light" />
        </div>
        <h3 className="text-xl font-bold mb-2">Unlock Your Free ADU Feasibility Report</h3>
        <p className="text-sm text-white/80 max-w-md mx-auto">
          Enter your information to access your property analysis. This report provides valuable feasibility insight that property owners often pay hundreds or even thousands of dollars for.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="p-6 space-y-4" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lcf-first" className={labelClass}>
              <User className="h-3 w-3 inline mr-1" />
              First Name *
            </label>
            <input
              id="lcf-first"
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
            <label htmlFor="lcf-last" className={labelClass}>
              <User className="h-3 w-3 inline mr-1" />
              Last Name *
            </label>
            <input
              id="lcf-last"
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

        <div>
          <label htmlFor="lcf-email" className={labelClass}>
            <Mail className="h-3 w-3 inline mr-1" />
            Email Address *
          </label>
          <div className="relative">
            <input
              id="lcf-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Reset validation when email changes
                if (emailValidation) setEmailValidation(null);
              }}
              placeholder="john@example.com"
              className={inputClass(!!errors.email, !!emailValidation?.valid)}
            />
            {emailValidation?.valid && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            )}
          </div>
          <FieldError message={errors.email} />
        </div>

        <div>
          <label htmlFor="lcf-phone" className={labelClass}>
            <Phone className="h-3 w-3 inline mr-1" />
            Phone Number *
            <span className="font-normal text-muted-foreground/80 ml-1">(for verification)</span>
          </label>
          <input
            id="lcf-phone"
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

        <div>
          <label htmlFor="lcf-address" className={labelClass}>
            <MapPin className="h-3 w-3 inline mr-1" />
            Property Address *
          </label>
          <input
            id="lcf-address"
            type="text"
            autoComplete="street-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, San Diego, CA"
            className={inputClass(!!errors.address)}
          />
          <FieldError message={errors.address} />
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
          disabled={validatingEmail || sendingOtp || submitting}
        >
          {validatingEmail ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating Email...
            </>
          ) : sendingOtp ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending Code...
            </>
          ) : submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Unlocking Report...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Unlock My Report
            </>
          )}
        </Button>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Secure verification
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
    </div>
  );
}
