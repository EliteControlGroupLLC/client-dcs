"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { trackContactFormSubmitted } from "@/lib/analytics";
import { COMPANY_INFO } from "@/lib/data/site-data";

// Same field treatment as the lead-gate form (components/lead-gate/lead-gate.tsx)
// so every form on the site reads identically.
const fieldClass =
  "w-full h-11 px-3 rounded-lg border border-border bg-white text-sm text-secondary placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";
const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "We could not submit your request. Please try again.");
      }
      trackContactFormSubmitted(formData.service);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted pt-40 pb-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto text-center p-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-secondary mb-4">
              Thank You!
            </h1>
            <p className="text-muted-foreground mb-6">
              We&apos;ve received your message and will get back to you within 24 hours.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" rounded="full">
              Send Another Message
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted pt-40 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            CONTACT
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to start your project? Have questions? We&apos;re here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Phone</h3>
                    <a href={`tel:${COMPANY_INFO.phoneHref}`} className="block text-muted-foreground hover:text-primary transition-colors">{COMPANY_INFO.phone}</a>
                    <p className="text-sm text-muted-foreground">Monday - Friday, 8:00 AM - 4:30 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-secondary">Email</h3>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="block break-all text-muted-foreground hover:text-primary transition-colors">{COMPANY_INFO.email}</a>
                    <p className="text-sm text-muted-foreground">We reply within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Office</h3>
                    <p className="text-muted-foreground">{COMPANY_INFO.office}</p>
                    <p className="text-sm text-muted-foreground">Serving all of San Diego County</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Friday</p>
                    <p className="text-muted-foreground">8:00 AM - 4:30 PM</p>
                    <p className="text-sm text-muted-foreground">Saturday by appointment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className={labelClass}>
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Smith"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={labelClass}>
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className={labelClass}>
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(619) 555-0123"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-service" className={labelClass}>
                      Service Interested In
                    </label>
                    <select
                      id="contact-service"
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      className={`${fieldClass} ${formData.service ? "" : "!text-muted-foreground/70"}`}
                    >
                      <option value="">Select a service...</option>
                      {serviceTypes.map((service) => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className={labelClass}>
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us about your project..."
                    className={`${fieldClass} h-auto py-2.5 resize-none`}
                  />
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {submitError}
                    </p>
                  </div>
                )}

                <Button type="submit" size="lg" rounded="full" className="w-full" disabled={isSubmitting}>
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting this form, you agree to our{" "}
                  <a href="/privacy" className="underline underline-offset-2 hover:text-secondary">privacy policy</a>. We&apos;ll never share your information.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
