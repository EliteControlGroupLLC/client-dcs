"use client";

import { useState } from "react";
import { AddressAutocompleteInput } from "@/components/property-scanner/address-autocomplete-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField, FormAlert } from "@/components/ui/form";
import { trackContactFormSubmitted } from "@/lib/analytics";
import { COMPANY_INFO } from "@/lib/data/site-data";

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
    address: "",
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
              <Button onClick={() => setSubmitted(false)} size="lg" variant="outlineWhite" rounded="full" className="w-full sm:w-auto">
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField tone="dark" label="Full Name *" htmlFor="contact-name">
                      <Input
                        tone="dark"
                        id="contact-name"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Smith"
                      />
                    </FormField>
                    <FormField tone="dark" label="Email *" htmlFor="contact-email">
                      <Input
                        tone="dark"
                        id="contact-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                      />
                    </FormField>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField tone="dark" label="Phone Number *" htmlFor="contact-phone">
                      <Input
                        tone="dark"
                        id="contact-phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(619) 555-0123"
                      />
                    </FormField>
                    <FormField tone="dark" label="Service Interested In" htmlFor="contact-service">
                      <Select
                        tone="dark"
                        id="contact-service"
                        placeholder="Select a service..."
                        value={formData.service}
                        onChange={(e) => setFormData({...formData, service: e.target.value})}
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
                    hint="Where the work would happen. Start typing and pick your address from the list."
                  >
                    <AddressAutocompleteInput
                      id="contact-address"
                      compact
                      value={formData.address}
                      onChange={(value) => setFormData({ ...formData, address: value })}
                      onSelect={(value) => setFormData({ ...formData, address: value })}
                      placeholder="1015 Monterrey Ct, Chula Vista"
                    />
                  </FormField>

                  <FormField tone="dark" label="Message *" htmlFor="contact-message">
                    <Textarea
                      tone="dark"
                      id="contact-message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tell us about your project..."
                    />
                  </FormField>

                  <FormAlert tone="dark">{submitError}</FormAlert>

                  <Button type="submit" size="lg" rounded="full" className="w-full" disabled={isSubmitting}>
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>

                  <p className="text-xs text-center text-white/75">
                    By submitting this form, you agree to our{" "}
                    <a href="/privacy" className="text-accent-light underline underline-offset-2 hover:text-white">privacy policy</a>. We&apos;ll never share your information.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
