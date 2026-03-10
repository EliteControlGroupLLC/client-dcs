"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { Button } from "@/components/ui/button";
import { Wand2, Clock, DollarSign, Shield, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Wand2,
    title: "Interactive Design",
    description: "Customize every aspect of your ADU with real-time visualization",
  },
  {
    icon: DollarSign,
    title: "Instant Pricing",
    description: "See costs update as you select options—no surprises",
  },
  {
    icon: Clock,
    title: "Takes 5 Minutes",
    description: "Quick and easy process to get your custom quote",
  },
  {
    icon: Shield,
    title: "No Obligation",
    description: "Explore freely—consult with us when you're ready",
  },
];

export function StepWelcome() {
  const { nextStep } = useADU();

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Wand2 className="h-10 w-10 text-primary" />
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
        Build Your Dream ADU
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
        Welcome to our interactive ADU configurator. In just a few steps, you'll design 
        your perfect accessory dwelling unit and get an instant price estimate.
      </p>

      {/* Benefits grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {benefits.map((benefit) => (
          <div 
            key={benefit.title}
            className="flex items-start gap-4 p-4 bg-muted rounded-xl text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <benefit.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What you'll get */}
      <div className="bg-secondary/5 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-secondary mb-3">What you'll get:</h3>
        <ul className="space-y-2 text-sm text-left max-w-md mx-auto">
          {[
            "Custom ADU design tailored to your property",
            "Detailed price breakdown with no hidden costs",
            "Estimated rental income potential",
            "Option to save and share your design",
            "No-pressure consultation scheduling",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Button size="lg" onClick={nextStep} className="group">
        Let's Get Started
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
