"use client";

import { useState, useEffect } from "react";
import { Lock, User, Mail, Phone, MapPin, Loader2, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadCaptureFormProps {
  propertyAddress: string;
  scanResults: Record<string, unknown>;
  onReportUnlocked?: () => void;
}

export function LeadCaptureForm({
  propertyAddress,
  scanResults,
  onReportUnlocked,
}: LeadCaptureFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(propertyAddress);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill address when propertyAddress changes
  useEffect(() => {
    setAddress(propertyAddress);
  }, [propertyAddress]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Allow various formats: (619) 555-0123, 619-555-0123, 6195550123, etc.
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!address.trim()) {
      newErrors.address = "Property address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
              errors.email ? "border-red-400 bg-red-50" : "border-border"
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            <Phone className="h-3 w-3 inline mr-1" />
            Phone Number *
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
          disabled={submitting}
        >
          {submitting ? (
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
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            <span>No obligation</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Built for San Diego</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            <span>Instant access</span>
          </div>
        </div>
      </form>
    </div>
  );
}
