"use client";

import { useState, useEffect } from "react";
import { Lock, User, Mail, Phone, MapPin, Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadCaptureFormProps {
  propertyAddress: string;
  scanResults: Record<string, unknown>;
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
  lastSentAt?: number;
}

export function LeadCaptureForm({
  propertyAddress,
  scanResults,
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
        }));
        return true;
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
          // Verification data
          verification: {
            emailValidated: emailValidation?.valid || false,
            emailScore: emailValidation?.score || 0,
            emailIsDisposable: emailValidation?.isDisposable || false,
            phoneVerified: true,
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
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-4">
            <Phone className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold mb-2">Verify Your Phone Number</h3>
          <p className="text-sm text-white/80 max-w-md mx-auto">
            We sent a verification code to <strong>{phone}</strong>. Enter it below to unlock your report.
          </p>
        </div>

        {/* OTP Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Verification Code
            </label>
            <input
              type="text"
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
            {errors.otp && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.otp}
              </p>
            )}
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
                className="text-xs text-primary hover:underline disabled:opacity-50"
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
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-4">
          <Lock className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold mb-2">Unlock Your Free ADU Feasibility Report</h3>
        <p className="text-sm text-white/80 max-w-md mx-auto">
          Enter your information to access your property analysis. This report provides valuable feasibility insight that property owners often pay hundreds or even thousands of dollars for.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              <User className="h-3 w-3 inline mr-1" />
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                errors.firstName ? "border-red-400 bg-red-50" : "border-border"
              }`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              <User className="h-3 w-3 inline mr-1" />
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                errors.lastName ? "border-red-400 bg-red-50" : "border-border"
              }`}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            <Mail className="h-3 w-3 inline mr-1" />
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Reset validation when email changes
                if (emailValidation) setEmailValidation(null);
              }}
              placeholder="john@example.com"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                errors.email ? "border-red-400 bg-red-50" : 
                emailValidation?.valid ? "border-green-400 bg-green-50" : "border-border"
              }`}
            />
            {emailValidation?.valid && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            <Phone className="h-3 w-3 inline mr-1" />
            Phone Number *
            <span className="text-[10px] text-muted-foreground/70 ml-1">(for verification)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(619) 555-0123"
            className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
              errors.phone ? "border-red-400 bg-red-50" : "border-border"
            }`}
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            <MapPin className="h-3 w-3 inline mr-1" />
            Property Address *
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, San Diego, CA"
            className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
              errors.address ? "border-red-400 bg-red-50" : "border-border"
            }`}
          />
          {errors.address && (
            <p className="text-xs text-red-500 mt-1">{errors.address}</p>
          )}
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
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Secure verification</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            <span>No spam, ever</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span>Data protected</span>
          </div>
        </div>
      </form>
    </div>
  );
}
