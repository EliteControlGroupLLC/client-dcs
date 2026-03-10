"use client";

import { useState } from "react";
import { useADU } from "@/lib/contexts/adu-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Loader2, Phone, Mail, MessageSquare, Download, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ADU_TYPES, ADU_SIZES } from "@/lib/types/adu";

export function StepContact() {
  const { config, pricing, prevStep } = useADU();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredContact: "email" as "email" | "phone" | "text",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulate API call - replace with actual Supabase call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setStatus("success");
  };

  const typeInfo = config.aduType ? ADU_TYPES[config.aduType] : null;
  const sizeInfo = config.size && config.size !== "custom" ? ADU_SIZES[config.size] : null;

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        
        <h2 className="text-3xl font-bold text-secondary mb-4">
          Your Quote Request is Submitted!
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
          Thank you for your interest! A member of our team will contact you within 24 hours 
          to discuss your ADU project.
        </p>

        {/* Summary card */}
        <Card className="max-w-md mx-auto mb-8 text-left">
          <CardContent className="p-6">
            <h3 className="font-semibold text-secondary mb-4">Your ADU Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{typeInfo?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">{sizeInfo?.sqft || config.sqft} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bedrooms</span>
                <span className="font-medium">{config.bedrooms === 0 ? "Studio" : config.bedrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bathrooms</span>
                <span className="font-medium">{config.bathrooms}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold text-secondary">Estimated Total</span>
                <span className="font-bold text-primary">{formatCurrency(pricing.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4" />
            Download Summary
          </Button>
          <Button className="w-full">
            <Calendar className="h-4 w-4" />
            Schedule Call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-2">Get Your Free Quote</h2>
      <p className="text-muted-foreground mb-8">
        Enter your details and we'll send you a detailed quote within 24 hours.
      </p>

      {/* Price summary */}
      <Card className="mb-8 border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary">Your ADU Estimate</h3>
            <span className="text-3xl font-bold text-primary">{formatCurrency(pricing.total)}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Type</span>
              <span className="font-medium">{typeInfo?.label}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Size</span>
              <span className="font-medium">{sizeInfo?.sqft || config.sqft} sq ft</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Beds</span>
              <span className="font-medium">{config.bedrooms === 0 ? "Studio" : config.bedrooms}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Baths</span>
              <span className="font-medium">{config.bathrooms}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            placeholder="Smith"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Phone"
          type="tel"
          placeholder="(619) 555-1234"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        {/* Preferred contact method */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Preferred Contact Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "email", icon: Mail, label: "Email" },
              { id: "phone", icon: Phone, label: "Phone" },
              { id: "text", icon: MessageSquare, label: "Text" },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setFormData({ ...formData, preferredContact: method.id as "email" | "phone" | "text" })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                  formData.preferredContact === method.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-secondary hover:border-primary/50"
                }`}
              >
                <method.icon className="h-4 w-4" />
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            placeholder="Tell us more about your project, timeline, or any questions you have..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full h-24 rounded-xl border border-input bg-background px-4 py-3 text-base resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-between pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button type="submit" size="lg" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Get My Free Quote"
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By submitting, you agree to our Privacy Policy. No spam, ever.
        </p>
      </form>
    </div>
  );
}
