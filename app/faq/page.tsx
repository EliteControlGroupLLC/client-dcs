"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

const faqs = [
  {
    category: "ADU General",
    questions: [
      {
        q: "What is an ADU?",
        a: "An ADU (Accessory Dwelling Unit) is a secondary housing unit on a single-family residential lot. It can be a detached structure, an attached addition, or a garage conversion. ADUs are fully permitted, self-contained living spaces with their own kitchen, bathroom, and entrance.",
      },
      {
        q: "How much does an ADU cost in San Diego?",
        a: "ADU costs in San Diego typically range from about $155,000 for a garage conversion to roughly $520,000 for a larger 1,200 sq ft detached or two-story build. Compact detached ADUs start at $175,000 and attached ADUs start around $220,000. Final pricing depends on size, layout, site conditions, and finish level.",
      },
      {
        q: "How long does it take to build an ADU?",
        a: "The total timeline from design to completion is typically 12-16 months. This includes design and engineering (1-2 months), permitting (6-9 months), and construction (3-4 months). We manage the entire process for you.",
      },
      {
        q: "Do I need permits to build an ADU?",
        a: "Yes, all ADUs require building permits from the City of San Diego. We handle the entire permitting process, including architectural plans, engineering, and city submissions.",
      },
    ],
  },
  {
    category: "Pricing & Financing",
    questions: [
      {
        q: "Do you offer fixed-price contracts?",
        a: "Yes. We provide fixed-price contracts so you know exactly what your project will cost before construction begins. No hidden fees or surprise charges.",
      },
      {
        q: "What financing options are available?",
        a: "We work with trusted lenders who offer home equity loans, construction loans, FHA 203(k) loans, and California-specific ADU financing programs. We can help connect you with the right option during your consultation.",
      },
      {
        q: "Is there a free consultation?",
        a: "Yes. We offer free initial consultations to discuss your project, assess your property, and provide a preliminary estimate. There is no obligation.",
      },
    ],
  },
  {
    category: "Construction Process",
    questions: [
      {
        q: "Are you licensed and insured?",
        a: "Yes. Distinct Construction Solutions is a fully licensed California General Contractor (CSLB License #1098531), bonded, and insured. Your property is fully protected throughout the project.",
      },
      {
        q: "Will I have a dedicated project manager?",
        a: "Yes. Every project is assigned a dedicated project manager who serves as your primary point of contact throughout construction, providing regular updates and responsive communication.",
      },
      {
        q: "Do you handle permits and inspections?",
        a: "Yes. We manage the entire permit process from application through final inspection. You do not need to interact with the city directly.",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-lg font-medium text-secondary pr-4">{question}</span>
        <ChevronDown className={`h-5 w-5 text-primary shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white/80">
              Get answers to common questions about ADUs, our construction process, pricing, and more.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {faqs.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="text-2xl font-bold text-secondary mb-6">{category.category}</h2>
              <div>
                {category.questions.map((faq) => (
                  <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our team is happy to answer any questions about your project.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-secondary font-semibold">
              Contact Us <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
